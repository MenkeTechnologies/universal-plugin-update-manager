#!/usr/bin/env bash
cd "$(dirname "$0")/.."
source scripts/cyberpunk.sh

rbw_banner
rbw_status "OPERATION" "REBUILD // bust + clean + build"
echo

rbw_section "CACHE BUST"
VER=$(node -e "const f=require('fs'),p='frontend/index.html';let h=f.readFileSync(p,'utf8');const v=Date.now()%100000;h=h.replace(/\?v=\d+/g,'?v='+v);f.writeFileSync(p,h);console.log(v)")
rbw_ok "assets busted to v${VER}"
echo

rbw_section "CLEAN"
command rm -rf src-tauri/target dist node_modules/.cache
rbw_ok "build caches purged"
echo

rbw_section "BUILD"
rbw_line
echo
START=$(date +%s)
pnpm tauri build 2>&1 | tail -8
END=$(date +%s)
ELAPSED=$((END - START))
echo
rbw_line

if [ -d "src-tauri/target/release/bundle/macos/AUDIO_HAXOR.app" ]; then
  APP_SIZE=$(du -sh src-tauri/target/release/bundle/macos/AUDIO_HAXOR.app | awk '{print $1}')
  rbw_ok "built in ${ELAPSED}s // ${APP_SIZE}"
  rbw_tagline "RECONSTRUCTION COMPLETE."
else
  rbw_fail "build failed after ${ELAPSED}s"
  rbw_tagline "RECONSTRUCTION FAILED."
fi
rbw_line
