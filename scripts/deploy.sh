#!/usr/bin/env bash
cd "$(dirname "$0")/.."
source scripts/cyberpunk.sh

rbw_banner
rbw_status "OPERATION" "DEPLOY // build + clear caches + launch"
echo

rbw_section "BUILD"
START=$(date +%s)
pnpm tauri build 2>&1 | tail -5
END=$(date +%s)
ELAPSED=$((END - START))

if [ ! -d "src-tauri/target/release/bundle/macos/AUDIO_HAXOR.app" ]; then
  rbw_fail "build failed after ${ELAPSED}s"
  rbw_tagline "DEPLOYMENT ABORTED."
  exit 1
fi
APP_SIZE=$(du -sh src-tauri/target/release/bundle/macos/AUDIO_HAXOR.app | awk '{print $1}')
rbw_ok "built in ${ELAPSED}s // ${APP_SIZE}"
echo

rbw_section "CLEAR WEBVIEW CACHES"
command rm -rf ~/Library/WebKit/audio-haxor ~/Library/WebKit/com.menketechnologies.audio-haxor ~/Library/Caches/audio-haxor ~/Library/Caches/com.menketechnologies.audio-haxor 2>/dev/null
rbw_ok "caches purged"
echo

rbw_section "LAUNCH"
open src-tauri/target/release/bundle/macos/AUDIO_HAXOR.app
rbw_ok "app launched"

rbw_tagline "SYSTEM ONLINE. JACK IN."
rbw_line
