#pragma once

namespace audio_haxor {

/** Ignore SIGPIPE; register fatal-signal and std::terminate handlers that log a backtrace. */
void installEngineCrashHandlers();

} // namespace audio_haxor
