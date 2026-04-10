#include "CocoaHelpers.hpp"

#import <AppKit/AppKit.h>
#import <Foundation/Foundation.h>

namespace audio_haxor
{

void finishCocoaAppLaunching()
{
    @autoreleasepool
    {
        // `[NSApplication sharedApplication]` is idempotent — JUCE's `ScopedJuceInitialiser_GUI`
        // already called it, but calling again is safe and ensures NSApp exists before
        // `finishLaunching`.
        NSApplication* app = [NSApplication sharedApplication];

        // `finishLaunching` is internally guarded against multiple invocations: AppKit checks
        // an internal flag and is a no-op if already finished. Safe to call unconditionally.
        // Side effects:
        //   - posts NSApplicationWillFinishLaunchingNotification
        //   - installs the app's CFRunLoop observers (which is what makes XPC delivery work)
        //   - posts NSApplicationDidFinishLaunchingNotification
        //   - registers the process with LaunchServices as a real Cocoa app
        // The LaunchServices registration is the load-bearing piece for `audiocomponentd` to
        // accept this process as a host for out-of-process AU plugins. Without it, our
        // bundle identity exists on disk (via the helper .app's Info.plist) but not in
        // LaunchServices' running-process map.
        [app finishLaunching];
    }
}

void activateAsForegroundApp()
{
    @autoreleasepool
    {
        NSApplication* app = [NSApplication sharedApplication];

        // Step 1: transition from "agent" (LSUIElement=true sets us as Accessory) to
        // a "Regular" foreground app. JUCE does only this part via
        // `juce::Process::makeForegroundProcess`.
        [app setActivationPolicy: NSApplicationActivationPolicyRegular];

        // Step 2: actually become the active (frontmost / key) app. Without this, the
        // process is "Regular" but inactive, and macOS does not service the run-loop
        // sources that AU `_RemoteAUv2ViewFactory` uses to deliver the populated NSView
        // over XPC. JUCE does NOT do this step, which is why `makeForegroundProcess`
        // alone is insufficient for OOP AU view embedding in a sidecar process.
        [app activateIgnoringOtherApps: YES];
    }
}

} // namespace audio_haxor
