/**
 * User-visible toasts must use `toastFmt('toast.*', …)` (or dynamic `String(err)`), not raw
 * English string literals as the first argument to `showToast`.
 *
 * Complements `i18n-js-keys.test.js` (catalog key literals) — catches prose that never
 * referenced a key.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsRoot = join(root, 'frontend/js');

/** `showToast(` then optional space then `'` or `"` — raw literal first argument */
const RAW_SHOWTOAST = /showToast\s*\(\s*(['"])/;

function collectJsFiles(dir, out = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) collectJsFiles(p, out);
    else if (ent.isFile() && ent.name.endsWith('.js')) out.push(p);
  }
  return out;
}

test('frontend/js: no showToast( with raw string literal as first argument', () => {
  const violations = [];
  for (const file of collectJsFiles(jsRoot)) {
    const text = readFileSync(file, 'utf8');
    const rel = file.slice(root.length + 1);
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!RAW_SHOWTOAST.test(line)) continue;
      // Template literals as first arg (rare)
      if (/showToast\s*\(\s*`/.test(line)) {
        violations.push(`${rel}:${i + 1}: template literal`);
        continue;
      }
      violations.push(`${rel}:${i + 1}: ${line.trim().slice(0, 120)}`);
    }
  }
  assert.deepEqual(
    violations,
    [],
    `Use toastFmt('toast.*') instead of raw English in showToast (${violations.length} line(s))`
  );
});
