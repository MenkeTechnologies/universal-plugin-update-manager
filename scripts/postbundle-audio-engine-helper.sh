#!/usr/bin/env bash
# postbundle-audio-engine-helper.sh
#
# Reshape the bundled `audio-engine` sidecar (Tauri externalBin output) into a nested macOS
# helper .app inside the parent bundle's Contents/Frameworks/, then re-sign the result.
#
# Without this reshape, the audio-engine runs as a bare Mach-O sibling of the main
# `audio-haxor` binary in Contents/MacOS/. macOS resolves [NSBundle mainBundle] for that
# process by walking up to the nearest enclosing .app, which lands on AUDIO_HAXOR.app —
# so the helper inherits the parent's bundle context. audiocomponentd then refuses (or
# silently stalls) the XPC view-controller delivery for AU plugins loaded out-of-process
# via _RemoteAUv2ViewFactory, leaving plugin editor windows blank (1×1 stub NSView).
#
# After this script:
#   AUDIO_HAXOR.app/Contents/Frameworks/AudioHaxorEngineHelper.app/Contents/MacOS/audio-engine
#   AUDIO_HAXOR.app/Contents/Frameworks/AudioHaxorEngineHelper.app/Contents/Info.plist
#
# [NSBundle mainBundle] from the helper now resolves to AudioHaxorEngineHelper.app (its own
# bundle ID, its own Info.plist, distinct from the parent), and audiocomponentd accepts the
# helper as a real Cocoa host. The Rust resolver in src-tauri/src/audio_engine.rs looks for
# the helper at this path before falling back to the legacy sibling-in-Contents/MacOS/ layout.
#
# Codesigning ordering matters: sign innermost first, work outward. The outer .app's
# CodeResources includes a hash of the inner .app's signature, so the inner .app must be
# fully signed before the outer .app re-signs. Re-signing the outer must NOT use --deep
# (which would recursively re-sign and overwrite the inner signatures we just made).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Allow caller to override; otherwise auto-detect the just-bundled .app.
APP="${1:-}"
if [ -z "$APP" ]; then
  for candidate in \
      "$REPO_ROOT/target/release/bundle/macos/AUDIO_HAXOR.app" \
      "$REPO_ROOT/src-tauri/target/release/bundle/macos/AUDIO_HAXOR.app"; do
    if [ -d "$candidate" ]; then
      APP="$candidate"
      break
    fi
  done
fi

if [ -z "$APP" ] || [ ! -d "$APP" ]; then
  echo "postbundle-audio-engine-helper: no AUDIO_HAXOR.app found (tried target/release and src-tauri/target/release)" >&2
  exit 1
fi

ENGINE_BIN_OLD="$APP/Contents/MacOS/audio-engine"
# IMPORTANT: helper .app lives in Contents/MacOS/, NOT Contents/Frameworks/.
# Apple's HIG says helper bundles go in Frameworks/, but real DAWs (Bitwig, Reaper, etc.)
# put them in MacOS/ — and only that location works for AU plugin hosting via
# audiocomponentd. We tried Frameworks/ first; it produces an `.app` whose
# `[NSBundle mainBundle]` resolves correctly, but audiocomponentd still rejects the
# process for OOP AU view-controller delivery (the `_RemoteAUv2ViewFactory` placeholder
# NSView never gets populated). Apparently LaunchServices treats `.app` bundles inside
# `Contents/Frameworks/` as embedded frameworks rather than registrable apps. Bitwig's
# `Bitwig Plug-in Host ARM64-NEON.app` lives at `Bitwig Studio.app/Contents/MacOS/` and
# their AU plugin editors work — that's our existence proof.
HELPER_APP="$APP/Contents/MacOS/AudioHaxorEngineHelper.app"
HELPER_CONTENTS="$HELPER_APP/Contents"
HELPER_MACOS="$HELPER_CONTENTS/MacOS"
HELPER_INFO="$HELPER_CONTENTS/Info.plist"
HELPER_BIN="$HELPER_MACOS/audio-engine"
INFO_TEMPLATE="$REPO_ROOT/audio-engine/helper-app/Info.plist"
ENTITLEMENTS="$REPO_ROOT/src-tauri/Entitlements.plist"
MAIN_BIN="$APP/Contents/MacOS/audio-haxor"
# Stale helper from previous postbundle runs that put it under Contents/Frameworks/.
LEGACY_HELPER_APP="$APP/Contents/Frameworks/AudioHaxorEngineHelper.app"

if [ ! -f "$INFO_TEMPLATE" ]; then
  echo "postbundle-audio-engine-helper: missing template $INFO_TEMPLATE" >&2
  exit 1
fi
if [ ! -f "$ENTITLEMENTS" ]; then
  echo "postbundle-audio-engine-helper: missing entitlements $ENTITLEMENTS" >&2
  exit 1
fi

# Clean up any stale helper from a previous run that put it under Contents/Frameworks/.
if [ -d "$LEGACY_HELPER_APP" ]; then
  echo "postbundle-audio-engine-helper: removing stale legacy helper at $LEGACY_HELPER_APP"
  command rm -rf "$LEGACY_HELPER_APP"
fi

# Idempotency: if the helper .app already exists with a binary, assume a previous
# postbundle run completed (e.g. user invoked the script twice). Skip the move but
# still re-sign in case sources changed.
if [ -f "$HELPER_BIN" ] && [ ! -f "$ENGINE_BIN_OLD" ]; then
  echo "postbundle-audio-engine-helper: helper .app already in place, re-signing only"
elif [ -f "$ENGINE_BIN_OLD" ]; then
  echo "postbundle-audio-engine-helper: moving $ENGINE_BIN_OLD -> $HELPER_BIN"
  command rm -rf "$HELPER_APP"
  mkdir -p "$HELPER_MACOS"
  mv "$ENGINE_BIN_OLD" "$HELPER_BIN"
  cp "$INFO_TEMPLATE" "$HELPER_INFO"
else
  echo "postbundle-audio-engine-helper: no audio-engine binary found at $ENGINE_BIN_OLD or $HELPER_BIN" >&2
  exit 1
fi

chmod +x "$HELPER_BIN"

# Strip any quarantine xattrs that would invalidate codesign.
xattr -cr "$HELPER_APP" 2>/dev/null || true
xattr -cr "$APP" 2>/dev/null || true

# Step 1: sign the helper .app bundle with hardened runtime + plugin host entitlements.
#
# Signing a *bundle* (a directory ending in .app) with `codesign` re-signs the bundle's
# main executable (CFBundleExecutable from Info.plist) as part of the same operation.
# That means we MUST pass --options runtime and --entitlements here, or the inner binary
# will end up with `flags=0x2(adhoc)` only — without the runtime flag, hardened runtime
# is OFF and the entitlements are inert (Apple ignores entitlements on non-runtime binaries).
#
# The plugin host entitlements (com.apple.security.cs.disable-library-validation,
# allow-jit, allow-unsigned-executable-memory, disable-executable-page-protection) are
# required for the helper to dlopen 3rd-party VST3/AU bundles signed by other Team IDs
# and for JIT-using plugins (Serum 2 wavetables, etc.) to allocate executable memory.
#
# Result on the inner binary: `flags=0x10002(adhoc,runtime)` + the four entitlement keys
# (verifiable with `codesign -dvv` and `codesign -d --entitlements - "$HELPER_BIN"`).
codesign --force --options runtime \
  --entitlements "$ENTITLEMENTS" \
  --sign - \
  "$HELPER_APP"

# Step 2: re-sign the outer .app bundle. Tauri already signed it with hardened runtime
# + the same Entitlements.plist for the `audio-haxor` main binary; the only thing we
# need to redo is the bundle's CodeResources (which was sealed before we moved the
# audio-engine sidecar from Contents/MacOS/ into Contents/Frameworks/). The main
# `audio-haxor` binary's existing signature is still valid (we never touched it).
#
# NOT --deep — that would recursively re-sign the inner helper .app we just signed in
# step 1, dropping the runtime flag again (codesign on a bundle without --options
# runtime always strips runtime even with --force). This is a JUCE-host classic that
# bites every plugin host that ships nested helper bundles.
#
# We DO pass --options runtime + --entitlements to be consistent with how Tauri signed
# the outer bundle originally; without these, re-signing the outer bundle would re-sign
# `audio-haxor` and strip ITS runtime flag, breaking 3rd-party VST3 loading in the
# main process (the same plugin-host entitlements failure mode).
codesign --force --options runtime \
  --entitlements "$ENTITLEMENTS" \
  --sign - \
  "$APP"

# Sanity check: verify both signatures and confirm the runtime flag survived.
codesign --verify --strict --verbose=2 "$HELPER_APP" 2>&1 | sed 's/^/postbundle-audio-engine-helper: helper verify: /'
codesign --verify --strict --verbose=2 "$APP" 2>&1 | sed 's/^/postbundle-audio-engine-helper: outer verify: /'

# Confirm runtime flag is present on both binaries — fail loudly if Apple stripped it,
# because the whole reason we wrote this script is for hardened-runtime + entitlements
# to take effect inside the helper.
for bin in "$HELPER_BIN" "$MAIN_BIN"; do
  flags=$(codesign -dvv "$bin" 2>&1 | grep -E '^CodeDirectory' | sed -n 's/.*flags=\([^ ]*\).*/\1/p')
  if [[ "$flags" != *"runtime"* ]]; then
    echo "postbundle-audio-engine-helper: ERROR: $bin missing 'runtime' flag (got: $flags)" >&2
    exit 1
  fi
  echo "postbundle-audio-engine-helper: $bin flags=$flags ✓"
done

echo "postbundle-audio-engine-helper: helper .app installed at $HELPER_APP"
