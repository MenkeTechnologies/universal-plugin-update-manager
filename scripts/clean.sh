#!/usr/bin/env bash
cd "$(dirname "$0")/.."
source scripts/cyberpunk.sh

rbw_banner
rbw_status "OPERATION" "CLEAN // purge build artifacts"
echo

rbw_section "DESTROYING CACHES"
BEFORE=$(du -sh src-tauri/target 2>/dev/null | awk '{print $1}' || echo "0B")
command rm -rf src-tauri/target dist node_modules/.cache
rbw_ok "freed ${BEFORE} // target + dist + node cache"

rbw_tagline "MEMORY WIPED. READY FOR FRESH BUILD."
rbw_line
