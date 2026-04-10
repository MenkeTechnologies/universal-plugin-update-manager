#!/usr/bin/env bash
cd "$(dirname "$0")/.."
source scripts/cyberpunk.sh

cyber_banner
cyber_status "OPERATION" "NUKE // total annihilation rebuild"
echo

cyber_section "PURGE WEBVIEW CACHES"
find ~/Library/WebKit/audio-haxor ~/Library/WebKit/com.menketechnologies.audio-haxor ~/Library/Caches/audio-haxor ~/Library/Caches/com.menketechnologies.audio-haxor -delete 2>/dev/null
cyber_ok "WebView caches obliterated"
echo

cyber_section "CACHE BUST"
node -e "const f=require('fs'),p='frontend/index.html';let h=f.readFileSync(p,'utf8');const v=Date.now()%100000;h=h.replace(/\?v=\d+/g,'?v='+v);f.writeFileSync(p,h);console.log('  busted to v'+v)"
echo

cyber_section "CLEAN BUILD ARTIFACTS"
# Workspace `target/` lives at repo root; legacy `src-tauri/target` may exist — remove both.
command rm -rf target src-tauri/target dist node_modules/.cache
cyber_ok "build caches destroyed"
echo

cyber_section "REBUILD FROM SCRATCH"
cyber_line
echo
START=$(date +%s)
# Full log on failure (do not pipe to tail — hides beforeBuildCommand / cargo errors).
if ! pnpm tauri build; then
  END=$(date +%s)
  ELAPSED=$((END - START))
  echo
  cyber_fail "tauri build failed after ${ELAPSED}s (see log above)"
  cyber_tagline "LAUNCH ABORTED"
  exit 1
fi
END=$(date +%s)
ELAPSED=$((END - START))
echo
cyber_line

# macOS only: reshape the bundled audio-engine sidecar into a nested helper .app under
# Contents/Frameworks/. Required for AU plugin editor windows — see the script and
# audio-engine/README.md "Helper .app architecture" for the full rationale.
if [[ "$(uname -s)" == "Darwin" ]]; then
  echo
  cyber_section "AUDIO ENGINE HELPER .APP RESHAPE"
  if ! bash scripts/postbundle-audio-engine-helper.sh; then
    cyber_fail "audio-engine helper .app reshape failed"
    cyber_tagline "LAUNCH ABORTED"
    exit 1
  fi
  cyber_ok "helper .app installed + signed"
  echo
fi

# Cargo workspace: bundle may be under repo `target/` or legacy `src-tauri/target/`.
BUNDLE_MAC=""
for d in target/release/bundle/macos/AUDIO_HAXOR.app src-tauri/target/release/bundle/macos/AUDIO_HAXOR.app; do
  if [ -d "$d" ]; then
    BUNDLE_MAC=$d
    break
  fi
done
if [ -n "$BUNDLE_MAC" ]; then
  APP_SIZE=$(du -sh "$BUNDLE_MAC" | awk '{print $1}')
  cyber_ok "binary deployed // ${APP_SIZE} // ${ELAPSED}s"
  cyber_tagline "NUCLEAR LAUNCH SUCCESSFUL"
else
  cyber_fail "build finished but .app bundle not found after ${ELAPSED}s"
  cyber_tagline "LAUNCH ABORTED"
fi
cyber_line
