#include <future>
#include <iostream>
#include <memory>
#include <string>
#include <thread>

#include <juce_events/juce_events.h>
#include <juce_gui_basics/juce_gui_basics.h>

#include "AppLog.hpp"
#include "CrashHandler.hpp"
#include "Engine.hpp"
#include "ParentWatchdog.hpp"

#ifndef AUDIO_ENGINE_VERSION_STRING
#define AUDIO_ENGINE_VERSION_STRING "2.0.0"
#endif

static juce::var errObjSimple(const juce::String& msg)
{
    auto* o = new juce::DynamicObject();
    o->setProperty("ok", false);
    o->setProperty("error", msg);
    return o;
}

/** Match `Engine` cmd key — used to route `ping` without `callAsync` (macOS pipe smoke tests). */
static juce::String cmdKeyMain(const juce::var& req)
{
    if (req.isObject())
        return req["cmd"].toString().toLowerCase();
    return {};
}

int main()
{
    audio_haxor::initAppLogFromEnv();
    audio_haxor::startParentWatchdogFromEnv();
    audio_haxor::installEngineCrashHandlers();
    juce::ScopedJuceInitialiser_GUI juceInit;
    audio_haxor::appLogLine(juce::String("started v") + AUDIO_ENGINE_VERSION_STRING);
    audio_haxor::Engine engine;
    audio_haxor::appLogLine("Engine constructed");

    std::thread stdinThread([&engine]() {
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

            // `ping` is handled on this thread so shell pipes work before / without relying on
            // `[NSApp run]` having processed a queued `callAsync` (see audio-engine README).
            if (cmdKeyMain(parsed) == "ping")
            {
                try
                {
                    std::cout << juce::JSON::toString(engine.dispatch(parsed), true) << '\n' << std::flush;
                }
                catch (const std::exception& e)
                {
                    audio_haxor::appLogLine(juce::String("dispatch exception: ") + e.what());
                    std::cout << juce::JSON::toString(errObjSimple(juce::String("exception: ") + e.what()), true)
                              << '\n' << std::flush;
                }
                catch (...)
                {
                    audio_haxor::appLogLine("dispatch exception: ...");
                    std::cout << juce::JSON::toString(errObjSimple("internal error"), true) << '\n' << std::flush;
                }
                continue;
            }

            auto prom = std::make_shared<std::promise<juce::var>>();
            std::future<juce::var> fut = prom->get_future();
            const bool posted = juce::MessageManager::callAsync([&engine, parsed, prom]() {
                try
                {
                    prom->set_value(engine.dispatch(parsed));
                }
                catch (const std::exception& e)
                {
                    audio_haxor::appLogLine(juce::String("dispatch exception: ") + e.what());
                    prom->set_value(errObjSimple(juce::String("exception: ") + e.what()));
                }
                catch (...)
                {
                    audio_haxor::appLogLine("dispatch exception: ...");
                    prom->set_value(errObjSimple("internal error"));
                }
            });
            if (!posted)
            {
                audio_haxor::appLogLine("MessageManager::callAsync failed to queue (post returned false)");
                std::cout << juce::JSON::toString(errObjSimple("IPC queue failed (callAsync)"), true) << '\n'
                          << std::flush;
                continue;
            }
            std::cout << juce::JSON::toString(fut.get(), true) << '\n' << std::flush;
        }
        audio_haxor::appLogLine("stdin closed, exiting");
        juce::MessageManager::callAsync([&engine]() {
            engine.shutdownEditors();
            juce::MessageManager::getInstance()->stopDispatchLoop();
        });
    });

    audio_haxor::appLogLine("entering runDispatchLoop (message thread)");
    juce::MessageManager::getInstance()->runDispatchLoop();
    audio_haxor::appLogLine("runDispatchLoop returned");
    stdinThread.join();
    return 0;
}
