#!/usr/bin/env bash
cd "$(dirname "$0")/.."
source scripts/cyberpunk.sh

DB_PATH="$HOME/Library/Application Support/com.menketechnologies.audio-haxor/audio_haxor.db"

cyber_banner
cyber_status "OPERATION" "DB VACUUM // reclaim dead space"
echo

if [ ! -f "$DB_PATH" ]; then
  cyber_fail "no database found"
  exit 1
fi

cyber_section "PRE-VACUUM"
BEFORE=$(ls -lh "$DB_PATH" | awk '{print $5}')
FREE=$(sqlite3 "$DB_PATH" "SELECT freelist_count * 100 / CASE WHEN page_count > 0 THEN page_count ELSE 1 END FROM pragma_page_count, pragma_freelist_count;" 2>/dev/null || echo "?")
echo -e "  ${D}size${N} ${W}$BEFORE${N}  ${D}dead${N} ${W}${FREE}%${N}"
echo

cyber_section "VACUUMING"
sqlite3 "$DB_PATH" "VACUUM;"
echo

cyber_section "POST-VACUUM"
AFTER=$(ls -lh "$DB_PATH" | awk '{print $5}')
echo -e "  ${D}before${N} ${W}$BEFORE${N}  ${D}after${N} ${G}$AFTER${N}"
cyber_ok "vacuum complete"

cyber_tagline "STORAGE OPTIMIZED."
cyber_line
