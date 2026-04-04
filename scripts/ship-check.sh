#!/usr/bin/env bash
# Ship readiness check — run before deploying a release build
set -euo pipefail

cd "$(dirname "$0")/.."

C='\033[0;36m'  # cyan
G='\033[0;32m'  # green
R='\033[0;31m'  # red
Y='\033[0;33m'  # yellow
N='\033[0m'     # reset

echo -e "${C}╔══════════════════════════════════════════╗${N}"
echo -e "${C}║        AUDIO_HAXOR SHIP CHECK            ║${N}"
echo -e "${C}╚══════════════════════════════════════════╝${N}"
echo

# Version
APP_VER=$(grep '"version"' package.json | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
CARGO_VER=$(grep '^version' src-tauri/Cargo.toml | head -1 | sed 's/.*= *"\(.*\)".*/\1/')
TAURI_VER=$(grep '"version"' src-tauri/tauri.conf.json | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
echo -e "${C}VERSION${N}"
echo "  package.json:    $APP_VER"
echo "  Cargo.toml:      $CARGO_VER"
echo "  tauri.conf.json: $TAURI_VER"
if [ "$APP_VER" = "$CARGO_VER" ] && [ "$APP_VER" = "$TAURI_VER" ]; then
  echo -e "  ${G}✓ All versions match${N}"
else
  echo -e "  ${R}✗ VERSION MISMATCH${N}"
fi
echo

# Git status
echo -e "${C}GIT${N}"
BRANCH=$(git branch --show-current)
DIRTY=$(git status -s | grep -v '^\?\?' | wc -l | tr -d ' ')
UNTRACKED=$(git status -s | grep '^\?\?' | wc -l | tr -d ' ')
echo "  Branch:    $BRANCH"
echo "  Dirty:     $DIRTY files"
echo "  Untracked: $UNTRACKED files"
if [ "$DIRTY" = "0" ]; then
  echo -e "  ${G}✓ Clean working tree${N}"
else
  echo -e "  ${Y}⚠ Uncommitted changes${N}"
  git status -s | grep -v '^\?\?' | head -5 | sed 's/^/    /'
fi
echo

# Rust tests
echo -e "${C}RUST TESTS${N}"
RUST_OUT=$(cargo test --manifest-path src-tauri/Cargo.toml --lib 2>&1 | tail -1)
RUST_PASS=$(echo "$RUST_OUT" | grep -o '[0-9]* passed' | grep -o '[0-9]*' || echo 0)
RUST_FAIL=$(echo "$RUST_OUT" | grep -o '[0-9]* failed' | grep -o '[0-9]*' || echo 0)
echo "  $RUST_OUT"
if [ "$RUST_FAIL" = "0" ]; then
  echo -e "  ${G}✓ All Rust tests pass${N}"
else
  echo -e "  ${R}✗ $RUST_FAIL TESTS FAILED${N}"
fi
echo

# JS tests
echo -e "${C}JS TESTS${N}"
JS_OUT=$(node --test test/*.test.js 2>&1 | grep -E '^ℹ (tests|pass|fail)' || true)
JS_TESTS=$(echo "$JS_OUT" | grep 'tests' | grep -o '[0-9]*' || echo 0)
JS_PASS=$(echo "$JS_OUT" | grep 'pass' | grep -o '[0-9]*' || echo 0)
JS_FAIL=$(echo "$JS_OUT" | grep 'fail' | grep -o '[0-9]*' || echo 0)
echo "  Tests: $JS_TESTS | Pass: $JS_PASS | Fail: $JS_FAIL"
if [ "$JS_FAIL" = "0" ]; then
  echo -e "  ${G}✓ All JS tests pass${N}"
else
  echo -e "  ${R}✗ $JS_FAIL TESTS FAILED${N}"
fi
echo

# Codebase stats
echo -e "${C}CODEBASE${N}"
RUST_LINES=$(wc -l src-tauri/src/*.rs | tail -1 | awk '{print $1}')
JS_LINES=$(wc -l frontend/js/*.js | tail -1 | awk '{print $1}')
HTML_LINES=$(wc -l frontend/index.html | awk '{print $1}')
CSS_LINES=$(grep -c '{' frontend/index.html || echo 0)
echo "  Rust:  $RUST_LINES lines ($(ls src-tauri/src/*.rs | wc -l | tr -d ' ') files)"
echo "  JS:    $JS_LINES lines ($(ls frontend/js/*.js | wc -l | tr -d ' ') files)"
echo "  HTML:  $HTML_LINES lines"
echo "  Tests: $((RUST_PASS + JS_PASS)) total ($RUST_PASS Rust + $JS_PASS JS)"
echo

# DB stats
echo -e "${C}DATABASE${N}"
DB_PATH="$HOME/Library/Application Support/com.menketechnologies.audio-haxor/audio_haxor.db"
if [ -f "$DB_PATH" ]; then
  DB_SIZE=$(ls -lh "$DB_PATH" | awk '{print $5}')
  echo "  Size: $DB_SIZE"
  sqlite3 "$DB_PATH" "
    SELECT '  Plugins:  ' || COUNT(*) FROM plugins;
    SELECT '  Samples:  ' || COUNT(*) FROM audio_samples;
    SELECT '  DAW:      ' || COUNT(*) FROM daw_projects;
    SELECT '  Presets:  ' || COUNT(*) FROM presets;
    SELECT '  KVR:      ' || COUNT(*) FROM kvr_cache;
  " 2>/dev/null || echo "  (could not query)"
  FREE=$(sqlite3 "$DB_PATH" "SELECT freelist_count * 100 / CASE WHEN page_count > 0 THEN page_count ELSE 1 END FROM pragma_page_count, pragma_freelist_count;" 2>/dev/null || echo "?")
  echo "  Dead space: ${FREE}%"
  if [ "$FREE" != "?" ] && [ "$FREE" -gt 20 ]; then
    echo -e "  ${Y}⚠ Consider running: pnpm db:vacuum${N}"
  else
    echo -e "  ${G}✓ DB is compact${N}"
  fi
else
  echo "  No database found"
fi
echo

# App log
echo -e "${C}APP LOG${N}"
LOG_PATH="$HOME/Library/Application Support/com.menketechnologies.audio-haxor/app.log"
if [ -f "$LOG_PATH" ]; then
  LOG_SIZE=$(ls -lh "$LOG_PATH" | awk '{print $5}')
  LOG_LINES=$(wc -l < "$LOG_PATH" | tr -d ' ')
  ERRORS=$(grep -c 'ERROR\|PANIC\|FAILED' "$LOG_PATH" 2>/dev/null || echo 0)
  STARTS=$(grep -c 'APP START' "$LOG_PATH" 2>/dev/null || echo 0)
  SHUTDOWNS=$(grep -c 'APP SHUTDOWN' "$LOG_PATH" 2>/dev/null || echo 0)
  echo "  Size: $LOG_SIZE ($LOG_LINES lines)"
  echo "  Starts: $STARTS | Shutdowns: $SHUTDOWNS | Errors: $ERRORS"
  if [ "$ERRORS" -gt 0 ]; then
    echo -e "  ${Y}⚠ Recent errors:${N}"
    grep 'ERROR\|PANIC\|FAILED' "$LOG_PATH" | tail -3 | sed 's/^/    /'
  else
    echo -e "  ${G}✓ No errors in log${N}"
  fi
else
  echo "  No log file"
fi
echo

# Binary
echo -e "${C}BUILD${N}"
APP="src-tauri/target/release/bundle/macos/AUDIO_HAXOR.app"
DMG="src-tauri/target/release/bundle/dmg/AUDIO_HAXOR_${APP_VER}_aarch64.dmg"
if [ -d "$APP" ]; then
  APP_SIZE=$(du -sh "$APP" | awk '{print $1}')
  echo "  .app: $APP_SIZE"
else
  echo -e "  ${Y}⚠ No .app found — run: pnpm tauri build${N}"
fi
if [ -f "$DMG" ]; then
  DMG_SIZE=$(ls -lh "$DMG" | awk '{print $5}')
  echo "  .dmg: $DMG_SIZE"
else
  echo -e "  ${Y}⚠ No .dmg found${N}"
fi
echo

# Summary
echo -e "${C}═══════════════════════════════════════════${N}"
TOTAL_ISSUES=0
[ "$DIRTY" != "0" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
[ "$RUST_FAIL" != "0" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
[ "$JS_FAIL" != "0" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
[ "$APP_VER" != "$CARGO_VER" ] && TOTAL_ISSUES=$((TOTAL_ISSUES + 1))

if [ "$TOTAL_ISSUES" = "0" ]; then
  echo -e "${G}  ✓ SHIP IT${N}"
else
  echo -e "${R}  ✗ $TOTAL_ISSUES issue(s) — fix before shipping${N}"
fi
echo
