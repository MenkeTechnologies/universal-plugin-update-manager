# audio-engine — JUCE-based AudioEngine (stdin/stdout JSON) for device I/O, file playback, VST3 scan.
cmake_minimum_required(VERSION 3.22)
project(audio_engine VERSION 2.4.11 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
  JUCE
  GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
  GIT_TAG        8.0.4
)
FetchContent_MakeAvailable(JUCE)

# JUCE 8 AU view-loading patch (macOS only).
#
# `juce::AudioUnitPluginWindowCocoa::createView` tries `kAudioUnitProperty_CocoaUI` first, obtains a
# legacy `NSView*` from the plugin, then unconditionally calls `kAudioUnitProperty_RequestViewController`
# and — if supported — `return true`s without ever attaching the legacy view to its `wrapper`. The
# editor is left waiting for an async `AUViewController` callback delivered via `NSXPCConnection`. In a
# spawned sidecar process (our `audio-engine`) that XPC delivery never arrives, so the wrapper stays
# nil and the editor renders permanently blank (white). Many AUv2 plugins — UAD, Sonimus SatsonCM,
# etc. — implement BOTH properties, so they all hit this. Verified empirically: editor child[0] reports
# `size=1x1 grandchildren=0` after `createEditorIfNeeded` (wrapper exists, no NSView attached).
#
# Fix: gate the `RequestViewController` block on `pluginView == nil`, so JUCE only takes the async path
# when the legacy CocoaUI path returned nothing. Idempotent — re-running the patch is a no-op.
if(APPLE)
  set(_juce_au_format
      "${juce_SOURCE_DIR}/modules/juce_audio_processors/format_types/juce_AudioUnitPluginFormat.mm")
  if(EXISTS "${_juce_au_format}")
    file(READ "${_juce_au_format}" _juce_au_content)
    string(FIND "${_juce_au_content}" "audio_haxor: prefer legacy CocoaUI" _au_already_patched)
    if(_au_already_patched EQUAL -1)
      set(_au_needle [==[        if (AudioUnitGetPropertyInfo (plugin.audioUnit, kAudioUnitProperty_RequestViewController, kAudioUnitScope_Global,
                                          0, &dataSize, &isWritable) == noErr
                && dataSize == sizeof (ViewControllerCallbackBlock))]==])
      string(FIND "${_juce_au_content}" "${_au_needle}" _au_needle_pos)
      if(_au_needle_pos EQUAL -1)
        message(FATAL_ERROR
          "audio_haxor: JUCE AU createView patch site not found. JUCE upstream signature changed; "
          "update CMakeLists.txt patch and audio-engine/src/Engine.cpp diagnostics to match.")
      endif()
      set(_au_repl [==[        // audio_haxor: prefer legacy CocoaUI over RequestViewController for AU view loading.
        // Many AUv2 plugins (UAD, Sonimus SatsonCM, etc.) implement BOTH the legacy CocoaUI property
        // and the modern RequestViewController. Stock JUCE 8 prefers the latter, drops the legacy view
        // it just obtained, then waits for an async XPC view-controller delivery that never arrives in
        // our spawned audio-engine subprocess -> permanently blank editor. Only take the async path
        // when CocoaUI gave nothing. See audio-engine/CMakeLists.txt for the full rationale.
        if (pluginView == nil
            && AudioUnitGetPropertyInfo (plugin.audioUnit, kAudioUnitProperty_RequestViewController, kAudioUnitScope_Global,
                                          0, &dataSize, &isWritable) == noErr
                && dataSize == sizeof (ViewControllerCallbackBlock))]==])
      string(REPLACE "${_au_needle}" "${_au_repl}" _juce_au_content_patched "${_juce_au_content}")
      file(WRITE "${_juce_au_format}" "${_juce_au_content_patched}")
      message(STATUS "audio_haxor: patched JUCE juce_AudioUnitPluginFormat.mm to prefer legacy CocoaUI")
    else()
      message(STATUS "audio_haxor: JUCE AU CocoaUI patch already applied")
    endif()
  endif()
endif()

juce_add_console_app(audio_engine
  PRODUCT_NAME "audio-engine"
  COMPANY_NAME "MenkeTechnologies"
)

# Tauri AudioEngine must be named `audio-engine` (hyphen), not CMake target `audio_engine`.
set_target_properties(audio_engine PROPERTIES OUTPUT_NAME "audio-engine")

target_sources(audio_engine PRIVATE
  src/Main.cpp
  src/AppLog.cpp
  src/CrashHandler.cpp
  src/ParentWatchdog.cpp
  src/VisualPreview.cpp
  src/Engine.cpp
)

if(APPLE)
  target_sources(audio_engine PRIVATE src/CocoaHelpers.mm)
  target_link_libraries(audio_engine PRIVATE "-framework AppKit" "-framework Foundation")
endif()

target_compile_definitions(audio_engine PRIVATE
  JUCE_WEB_BROWSER=0
  JUCE_USE_CURL=0
  JUCE_PLUGINHOST_VST3=1
  JUCE_PLUGINHOST_LADSPA=0
  JUCE_PLUGINHOST_LV2=0
  JUCE_MODAL_LOOPS_PERMITTED=1
)

if(APPLE)
  target_compile_definitions(audio_engine PRIVATE JUCE_PLUGINHOST_AU=1)
else()
  target_compile_definitions(audio_engine PRIVATE JUCE_PLUGINHOST_AU=0)
endif()

target_compile_definitions(audio_engine PRIVATE
  "AUDIO_ENGINE_VERSION_STRING=\"${PROJECT_VERSION}\""
)

target_link_libraries(audio_engine PRIVATE
  juce::juce_audio_basics
  juce::juce_audio_devices
  juce::juce_audio_formats
  juce::juce_audio_processors
  juce::juce_audio_utils
  juce::juce_dsp
  juce::juce_core
  juce::juce_events
  juce::juce_gui_basics
  PUBLIC
  juce::juce_recommended_config_flags
  juce::juce_recommended_warning_flags
)

# Keep JUCE/MSVC outputs out of Cargo's `target/` (Windows: stray MSVC DLLs next to `audio-engine.exe`
# break `cargo test` with STATUS_ENTRYPOINT_NOT_FOUND when resolving the Rust test binary).
# Layout: audio-engine-artifacts/debug|release/audio-engine
if(CMAKE_CONFIGURATION_TYPES)
  set_target_properties(audio_engine PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY_DEBUG "${CMAKE_SOURCE_DIR}/../audio-engine-artifacts/debug"
    RUNTIME_OUTPUT_DIRECTORY_RELEASE "${CMAKE_SOURCE_DIR}/../audio-engine-artifacts/release"
    RUNTIME_OUTPUT_DIRECTORY_MINSIZEREL "${CMAKE_SOURCE_DIR}/../audio-engine-artifacts/release"
    RUNTIME_OUTPUT_DIRECTORY_RELWITHDEBINFO "${CMAKE_SOURCE_DIR}/../audio-engine-artifacts/release"
  )
else()
  if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "" FORCE)
  endif()
  string(TOLOWER "${CMAKE_BUILD_TYPE}" _audio_engine_bt)
  set_target_properties(audio_engine PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/../audio-engine-artifacts/${_audio_engine_bt}"
  )
endif()
