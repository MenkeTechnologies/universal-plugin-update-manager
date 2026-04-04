#!/usr/bin/env bash
cd "$(dirname "$0")/.."
source scripts/cyberpunk.sh

cyber_banner
cyber_status "OPERATION" "DEPLOY // build + clear caches + launch"
echo

cyber_section "BUILD"
START=$(date +%s)
pnpm tauri build 2>&1 | tail -5
END=$(date +%s)
ELAPSED=$((END - START))

if [ ! -d "src-tauri/target/release/bundle/macos/AUDIO_HAXOR.app" ]; then
  cyber_fail "build failed after ${ELAPSED}s"
  cyber_tagline "DEPLOYMENT ABORTED."
  exit 1
fi
APP_SIZE=$(du -sh src-tauri/target/release/bundle/macos/AUDIO_HAXOR.app | awk '{print $1}')
cyber_ok "built in ${ELAPSED}s // ${APP_SIZE}"
echo

cyber_section "CLEAR WEBVIEW CACHES"
command rm -rf ~/Library/WebKit/audio-haxor ~/Library/WebKit/com.menketechnologies.audio-haxor ~/Library/Caches/audio-haxor ~/Library/Caches/com.menketechnologies.audio-haxor 2>/dev/null
cyber_ok "caches purged"
echo

cyber_section "LAUNCH"
open src-tauri/target/release/bundle/macos/AUDIO_HAXOR.app
cyber_ok "app launched"

cyber_tagline "SYSTEM ONLINE. JACK IN."
cyber_line
