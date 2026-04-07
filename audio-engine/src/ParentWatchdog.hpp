#pragma once

namespace audio_haxor {

/// If `AUDIO_HAXOR_PARENT_PID` is set, spawn a background thread that exits this process when
/// that PID disappears (e.g. host force-quit with SIGKILL — no Rust `atexit` / `RunEvent::Exit`).
void startParentWatchdogFromEnv();

} // namespace audio_haxor
