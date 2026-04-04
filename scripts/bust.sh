#!/usr/bin/env bash
cd "$(dirname "$0")/.."
source scripts/cyberpunk.sh

rbw_banner
rbw_status "OPERATION" "CACHE BUST // invalidate frontend assets"
echo

rbw_section "BUSTING CACHE SIGNATURES"
VER=$(node -e "const f=require('fs'),p='frontend/index.html';let h=f.readFileSync(p,'utf8');const v=Date.now()%100000;h=h.replace(/\?v=\d+/g,'?v='+v);f.writeFileSync(p,h);console.log(v)")
rbw_ok "all assets busted to v${VER}"

rbw_tagline "CACHE SIGNATURES ROTATED."
rbw_line
