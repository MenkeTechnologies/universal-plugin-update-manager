#!/usr/bin/env bash
cd "$(dirname "$0")/.."
source scripts/cyberpunk.sh

DB_PATH="$HOME/Library/Application Support/com.menketechnologies.audio-haxor/audio_haxor.db"

cyber_banner
cyber_status "OPERATION" "DB STATS // database overview"
echo

if [ ! -f "$DB_PATH" ]; then
  cyber_fail "no database found"
  exit 1
fi

DB_SIZE=$(ls -lh "$DB_PATH" | awk '{print $5}')
cyber_section "DATABASE"
echo -e "  ${D}size${N}  ${W}$DB_SIZE${N}"
echo

cyber_section "TABLE COUNTS"
PLUGINS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM plugins;" 2>/dev/null || echo "?")
SAMPLES=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM audio_samples;" 2>/dev/null || echo "?")
DAW=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM daw_projects;" 2>/dev/null || echo "?")
PRESETS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM presets;" 2>/dev/null || echo "?")
KVR=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM kvr_cache;" 2>/dev/null || echo "?")
WF=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM waveform_cache;" 2>/dev/null || echo "?")
SP=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM spectrogram_cache;" 2>/dev/null || echo "?")
XR=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM xref_cache;" 2>/dev/null || echo "?")
FP=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM fingerprint_cache;" 2>/dev/null || echo "?")
echo -e "  ${D}plugins${N}       ${W}$PLUGINS${N}"
echo -e "  ${D}samples${N}       ${W}$SAMPLES${N}"
echo -e "  ${D}daw projects${N}  ${W}$DAW${N}"
echo -e "  ${D}presets${N}       ${W}$PRESETS${N}"
echo -e "  ${D}kvr cache${N}     ${W}$KVR${N}"
echo -e "  ${D}waveforms${N}     ${W}$WF${N}"
echo -e "  ${D}spectrograms${N}  ${W}$SP${N}"
echo -e "  ${D}xref cache${N}    ${W}$XR${N}"
echo -e "  ${D}fingerprints${N}  ${W}$FP${N}"
echo

cyber_section "STORAGE"
FREE=$(sqlite3 "$DB_PATH" "SELECT freelist_count * 100 / CASE WHEN page_count > 0 THEN page_count ELSE 1 END FROM pragma_page_count, pragma_freelist_count;" 2>/dev/null || echo "?")
PAGES=$(sqlite3 "$DB_PATH" "PRAGMA page_count;" 2>/dev/null || echo "?")
FREE_PAGES=$(sqlite3 "$DB_PATH" "PRAGMA freelist_count;" 2>/dev/null || echo "?")
echo -e "  ${D}pages${N}      ${W}$PAGES${N}"
echo -e "  ${D}free${N}       ${W}$FREE_PAGES${N} ${D}(${FREE}%)${N}"
if [ "$FREE" != "?" ] && [ "$FREE" -gt 20 ]; then
  cyber_warn "run: pnpm db:vacuum"
else
  cyber_ok "storage optimal"
fi

cyber_tagline "DATABASE SCAN COMPLETE."
cyber_line
