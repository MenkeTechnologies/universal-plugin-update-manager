#!/usr/bin/env bash
cd "$(dirname "$0")/.."
source scripts/cyberpunk.sh

rbw_banner
rbw_status "OPERATION" "NUKE // total annihilation rebuild"
echo

rbw_section "PURGE WEBVIEW CACHES"
find ~/Library/WebKit/audio-haxor ~/Library/WebKit/com.menketechnologies.audio-haxor ~/Library/Caches/audio-haxor ~/Library/Caches/com.menketechnologies.audio-haxor -delete 2>/dev/null
rbw_ok "WebView caches obliterated"
echo

rbw_section "CACHE BUST"
node -e "const f=require('fs'),p='frontend/index.html';let h=f.readFileSync(p,'utf8');const v=Date.now()%100000;h=h.replace(/\?v=\d+/g,'?v='+v);f.writeFileSync(p,h);console.log('  busted to v'+v)"
echo

rbw_section "CLEAN BUILD ARTIFACTS"
command rm -rf src-tauri/target dist node_modules/.cache
rbw_ok "build caches destroyed"
echo

rbw_section "REBUILD FROM SCRATCH"
rbw_line
echo
pnpm tauri build 2>&1 | tail -8
echo
rbw_line

if [ -d "src-tauri/target/release/bundle/macos/AUDIO_HAXOR.app" ]; then
  APP_SIZE=$(du -sh src-tauri/target/release/bundle/macos/AUDIO_HAXOR.app | awk '{print $1}')
  rbw_ok "binary deployed // ${APP_SIZE}"
  rbw_tagline "NUCLEAR LAUNCH SUCCESSFUL"
else
  rbw_fail "build failed"
  rbw_tagline "LAUNCH ABORTED"
fi
rbw_line
