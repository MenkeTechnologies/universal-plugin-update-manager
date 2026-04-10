#!/usr/bin/env bash
# build.sh — wrapper for `pnpm build` that runs `tauri build` then the audio-engine
# helper-app reshape + DMG creation. Lighter alternative to `pnpm rebuild` / `pnpm nuke`
# (does NOT wipe target/ or WebView caches first — pure incremental build).
#
# On macOS this passes `--bundles app` to skip Tauri's own DMG step; the postbundle
# script then reshapes the .app and creates the DMG itself in one pass. Without this
# flag, Tauri builds an intermediate DMG containing the un-reshaped .app, and we'd
# either ship that broken DMG or have to throw it away and rebuild it (which leaves
# stale rw.NNNNN.*.dmg mounts dangling in Finder).
set -euo pipefail
cd "$(dirname "$0")/.."

TAURI_BUNDLE_ARGS=()
if [[ "$(uname -s)" == "Darwin" ]]; then
  TAURI_BUNDLE_ARGS=(--bundles app)
fi

pnpm tauri build "${TAURI_BUNDLE_ARGS[@]}"

if [[ "$(uname -s)" == "Darwin" ]]; then
  bash scripts/postbundle-audio-engine-helper.sh
fi
