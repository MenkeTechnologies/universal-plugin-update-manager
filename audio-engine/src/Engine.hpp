#pragma once

#include <juce_core/juce_core.h>
#include <memory>

namespace audio_haxor {

/** Out-of-process single-plugin scan (`--plugin-scan-one`). Returns process exit code (0 = success). */
int runPluginScanOneChild(int argc, char* argv[]);

class Engine
{
public:
    Engine();
    ~Engine();

    juce::var dispatch(const juce::var& req);

    /** Close all hosted insert editor windows (JUCE message thread). Call before stopping the message loop. */
    void shutdownEditors();

private:
    struct Impl;
    std::unique_ptr<Impl> impl;
};

} // namespace audio_haxor
