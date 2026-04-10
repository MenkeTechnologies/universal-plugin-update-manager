#include <atomic>
#include <iostream>
#include <memory>
#include <string>
#include <thread>

#include <juce_core/juce_core.h>

#include <juce_events/juce_events.h>
#include <juce_gui_basics/juce_gui_basics.h>

#include "AppLog.hpp"
#include "CocoaHelpers.hpp"
#include "CrashHandler.hpp"
#include "Engine.hpp"
#include "ParentWatchdog.hpp"

#ifndef AUDIO_ENGINE_VERSION_STRING
#define AUDIO_ENGINE_VERSION_STRING "2.4.2"
#endif

static juce::var errObjSimple(const juce::String& msg)
{
    auto* o = new juce::DynamicObject();
    o->setProperty("ok", false);
    o->setProperty("error", msg);
    return o;
}

/** One JSON line in → one JSON line out. Runs on the stdin thread (not the JUCE message thread). */
static void runStdinJsonLoop(audio_haxor::Engine& engine)
{
    audio_haxor::appLogLine("stdin reader thread started");
    std::string line;
    while (std::getline(std::cin, line))
    {
        const juce::String trimmed = juce::String(line).trim();
        if (trimmed.isEmpty())
            continue;

        const auto parsed = juce::JSON::parse(trimmed);
        if (parsed.isVoid())
        {
            audio_haxor::appLogLine("stdin: JSON parse failed");
            std::cout << R"({"ok":false,"error":"bad JSON"})" << '\n' << std::flush;
            continue;
        }

        // Always dispatch on this thread. `callAsync` + blocking on `fut.get()` from a worker thread
        // deadlocks on macOS until `[NSApp run]` is pumping; ordering hacks (atomic gates) could spin
        // forever if that pump never delivered the ready callback. `Engine::dispatch` serializes on
        // `impl->mutex`.
        try
        {
            std::cout << juce::JSON::toString(engine.dispatch(parsed), true) << '\n' << std::flush;
        }
        catch (const std::exception& e)
        {
            audio_haxor::appLogLine(juce::String("dispatch exception: ") + e.what());
            std::cout << juce::JSON::toString(errObjSimple(juce::String("exception: ") + e.what()), true) << '\n'
                      << std::flush;
        }
        catch (...)
        {
            audio_haxor::appLogLine("dispatch exception: ...");
            std::cout << juce::JSON::toString(errObjSimple("internal error"), true) << '\n' << std::flush;
        }
    }
    audio_haxor::appLogLine("stdin closed, exiting");
}

int main(int argc, char* argv[])
{
    if (argc >= 5 && juce::String(argv[1]) == "--plugin-scan-one")
    {
        audio_haxor::initAppLogFromEnv();
        audio_haxor::installEngineCrashHandlers();
        juce::ScopedJuceInitialiser_GUI juceInit;
        audio_haxor::appLogLine(juce::String("plugin-scan-one child v") + AUDIO_ENGINE_VERSION_STRING);
        return audio_haxor::runPluginScanOneChild(argc, argv);
    }

    audio_haxor::initAppLogFromEnv();
    audio_haxor::startParentWatchdogFromEnv();
    audio_haxor::installEngineCrashHandlers();
    juce::ScopedJuceInitialiser_GUI juceInit;
#if defined(__APPLE__)
    /* JUCE only does `[NSApplication sharedApplication]`; it never calls `finishLaunching`.
     * Without `finishLaunching`, NSApp is half-initialised — no `NSApplicationDidFinishLaunching`
     * notification, no CFRunLoop observers installed, and the process is not registered with
     * LaunchServices as a real Cocoa app. `audiocomponentd` then refuses to deliver XPC
     * view-controller callbacks for out-of-process AU plugins (`_RemoteAUv2ViewFactory`
     * returns a 1×1 placeholder NSView that never populates → blank editor windows).
     * Calling `finishLaunching` here is the canonical fix and is idempotent (AppKit guards
     * against multiple calls). Only safe in the helper-bundle layout where the process has
     * its own bundle identity (`com.menketechnologies.audio-haxor.audio-engine-helper`);
     * doing this from a bare sidecar that inherits the parent's bundle id would cause
     * LaunchServices conflicts and stall plugin instantiation. See
     * `audio-engine/README.md` "Helper .app architecture" for details. */
    audio_haxor::finishCocoaAppLaunching();
#endif
    audio_haxor::appLogLine(juce::String("started v") + AUDIO_ENGINE_VERSION_STRING);
    audio_haxor::Engine engine;
    audio_haxor::appLogLine("Engine constructed");

    std::atomic<bool> stdinDone{false};
    std::thread stdinThread([&engine, &stdinDone]() {
        runStdinJsonLoop(engine);
        stdinDone.store(true, std::memory_order_release);
    });

    audio_haxor::appLogLine("entering message pump loop (message thread)");
    while (!stdinDone.load(std::memory_order_acquire))
        juce::MessageManager::getInstance()->runDispatchLoopUntil(50);
    audio_haxor::appLogLine("message pump loop exited");

    engine.shutdownEditors();
    stdinThread.join();
    return 0;
}
