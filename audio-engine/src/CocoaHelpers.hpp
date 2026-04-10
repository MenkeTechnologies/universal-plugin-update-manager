#pragma once

namespace audio_haxor
{
/**
 * Call `[NSApplication sharedApplication]` followed by `[NSApp finishLaunching]`.
 *
 * `juce::ScopedJuceInitialiser_GUI` only does `sharedApplication`, leaving `NSApp` in a
 * half-initialised state where no `NSApplicationDidFinishLaunching` notification is posted
 * and the process is not registered with LaunchServices as a real Cocoa app. Without
 * `finishLaunching`, `audiocomponentd` treats us as a "background utility" and refuses to
 * deliver XPC view-controller callbacks for out-of-process AU plugins (`_RemoteAUv2ViewFactory`
 * returns a 1×1 placeholder NSView that never gets populated).
 *
 * `finishLaunching` is otherwise safe and reentrant; calling it once at engine startup is
 * the standard pattern for any host that wants `[NSApp run]`-equivalent semantics without
 * actually calling `[NSApp run]` (which we cannot, because we use `runDispatchLoopUntil`
 * for the message pump so the stdin reader thread can dispatch IPC commands).
 *
 * Must be called from the main thread, AFTER `juce::ScopedJuceInitialiser_GUI` constructs.
 *
 * No-op on non-Apple platforms (Linux/Windows have no NSApp).
 */
#if defined(__APPLE__)
void finishCocoaAppLaunching();
#else
inline void finishCocoaAppLaunching() {}
#endif

/**
 * Transition the process to a regular foreground app AND make it active.
 *
 * `juce::Process::makeForegroundProcess()` only calls `setActivationPolicy:Regular`. That
 * is necessary but not sufficient — the process becomes a "Regular" Cocoa app but is NOT
 * the active app, so it doesn't service certain run-loop sources (including the XPC
 * view-controller delivery from `audiocomponentd` for out-of-process AU plugins).
 *
 * This helper does both: `setActivationPolicy:Regular` + `activateIgnoringOtherApps:YES`,
 * which is what real Cocoa apps do when they need to come to the front. Required to get
 * `_RemoteAUv2ViewFactory` to actually populate its placeholder NSView with the real
 * plugin UI.
 *
 * Must be called from the main thread (the JUCE message thread).
 *
 * No-op on non-Apple platforms.
 */
#if defined(__APPLE__)
void activateAsForegroundApp();
#else
inline void activateAsForegroundApp() {}
#endif

} // namespace audio_haxor
