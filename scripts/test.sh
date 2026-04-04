#!/usr/bin/env bash
cd "$(dirname "$0")/.."
source scripts/cyberpunk.sh

cyber_banner
cyber_status "OPERATION" "TEST // full test suite"
echo

cyber_section "JS SUBSYSTEM"
START=$(date +%s)
JS_OUT=$(node --test test/*.test.js 2>&1)
JS_EXIT=$?
END=$(date +%s)
JS_TESTS=$(echo "$JS_OUT" | grep -E '^ℹ tests' | grep -o '[0-9]*' || echo 0)
JS_PASS=$(echo "$JS_OUT" | grep -E '^ℹ pass' | grep -o '[0-9]*' || echo 0)
JS_FAIL=$(echo "$JS_OUT" | grep -E '^ℹ fail' | grep -o '[0-9]*' || echo 0)
echo -e "  ${D}tests${N} ${W}$JS_TESTS${N}  ${D}pass${N} ${G}$JS_PASS${N}  ${D}fail${N} ${R}$JS_FAIL${N}  ${D}// $((END - START))s${N}"
if [ "$JS_FAIL" = "0" ] && [ "$JS_EXIT" = "0" ]; then
  cyber_ok "JS nominal"
else
  cyber_fail "JS compromised"
  echo "$JS_OUT" | grep -E 'not ok|✗|Error' | tail -5 | sed "s/^/  ${D}  /"
fi
echo

cyber_section "RUST SUBSYSTEM"
START=$(date +%s)
RUST_OUT=$(cargo test --manifest-path src-tauri/Cargo.toml --lib 2>&1)
RUST_EXIT=$?
END=$(date +%s)
RUST_RESULT=$(echo "$RUST_OUT" | grep 'test result' | tail -1)
RUST_PASS=$(echo "$RUST_RESULT" | grep -o '[0-9]* passed' | grep -o '[0-9]*' || echo "0")
RUST_FAIL=$(echo "$RUST_RESULT" | grep -o '[0-9]* failed' | grep -o '[0-9]*' || echo "0")
echo -e "  ${W}$RUST_RESULT${N}  ${D}// $((END - START))s${N}"
if [ "$RUST_FAIL" = "0" ] && [ "$RUST_EXIT" = "0" ]; then
  cyber_ok "Rust nominal"
else
  cyber_fail "Rust compromised"
fi
echo

TOTAL=$((JS_PASS + RUST_PASS))
cyber_line
if [ "$JS_FAIL" = "0" ] && [ "$RUST_FAIL" = "0" ]; then
  cyber_tagline "${TOTAL} TESTS PASSED. ALL SYSTEMS GO."
else
  echo
  echo -e "  ${R}>>> TESTS FAILED — FIX BEFORE SHIPPING <<<${N}"
  echo
fi
cyber_line
