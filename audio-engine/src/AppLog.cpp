#include "AppLog.hpp"

#include <chrono>
#include <cstring>
#include <fstream>
#include <mutex>

namespace audio_haxor {
namespace {

std::mutex g_appLogMutex;
juce::String g_appLogPath;

static juce::String utcTimestampString()
{
    using namespace std::chrono;
    const auto now = system_clock::now();
    const std::time_t t = system_clock::to_time_t(now);
    std::tm tm{};
#if defined(_WIN32)
    gmtime_s(&tm, &t);
#else
    gmtime_r(&t, &tm);
#endif
    char buf[32];
    std::strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", &tm);
    return juce::String(buf);
}

} // namespace

void initAppLogFromEnv()
{
    g_appLogPath = juce::SystemStats::getEnvironmentVariable("AUDIO_HAXOR_APP_LOG", {}).trim();
}

void appLogLine(const juce::String& message)
{
    if (g_appLogPath.isEmpty())
        return;

    const std::lock_guard<std::mutex> lock(g_appLogMutex);

    juce::File f(g_appLogPath);
    const juce::File parent = f.getParentDirectory();
    (void) parent.createDirectory();

    constexpr juce::int64 kMaxLogSize = 5 * 1024 * 1024;
    if (f.existsAsFile() && f.getSize() > kMaxLogSize)
    {
        const juce::File backup = parent.getChildFile(f.getFileName() + ".1");
        (void) f.moveFileTo(backup);
    }

    const juce::String line = juce::String("[") + utcTimestampString() + "] ENGINE: " + message + "\n";
    const auto path = f.getFullPathName().toStdString();
    std::ofstream out(path, std::ios::app | std::ios::binary);
    if (!out.is_open())
        return;
    out << line.toRawUTF8();
    out.flush();
}

} // namespace audio_haxor
