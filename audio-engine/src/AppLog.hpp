#pragma once

#include <juce_core/juce_core.h>

namespace audio_haxor {

/** Read `AUDIO_HAXOR_APP_LOG` (path to `app.log`); no-op if unset. */
void initAppLogFromEnv();

/** Append one timestamped line `[UTC] ENGINE: …` to `app.log` (same bracket timestamp as host `write_app_log_line`). */
void appLogLine(const juce::String& message);

} // namespace audio_haxor
