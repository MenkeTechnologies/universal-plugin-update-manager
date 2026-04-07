#pragma once

#include <juce_core/juce_core.h>
#include <memory>

namespace audio_haxor {

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
