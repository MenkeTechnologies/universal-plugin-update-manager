/**
 * Mechanical contract: visible UI strings must not use `appFmt`/`toastFmt` with a literal
 * English fallback (`? appFmt('key') : 'English'`). Use `catalogFmt` / `catalogFmtOrUnit` from
 * `frontend/js/utils.js` instead so the path always goes through the catalog (or the key when
 * `appFmt` is absent in VM tests).
 *
 * This does not prove every English word is gone (HTML, dynamic data, OS dialogs, etc.); it
 * enforces the no-inline-fallback pattern for the main formatter.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsRoot = join(root, 'frontend/js');

function collectJsFiles(dir, out = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) collectJsFiles(p, out);
    else if (ent.isFile() && ent.name.endsWith('.js')) out.push(p);
  }
  return out;
}

/** `appFmt(...) : '...'` or `toastFmt(...) : "..."` — false branch must not be a string literal. */
const FMT_STRING_FALLBACK_RE = /\b(appFmt|toastFmt)\s*\([^)]*\)\s*:\s*['"]/g;

test('frontend/js: no appFmt/toastFmt ternary with quoted string fallback', () => {
  const violations = [];
  for (const file of collectJsFiles(jsRoot)) {
    const text = readFileSync(file, 'utf8');
    FMT_STRING_FALLBACK_RE.lastIndex = 0;
    let m;
    while ((m = FMT_STRING_FALLBACK_RE.exec(text)) !== null) {
      const rel = file.slice(root.length + 1);
      const line = text.slice(0, m.index).split('\n').length;
      const snippet = text.slice(m.index, Math.min(text.length, m.index + 72)).replace(/\s+/g, ' ');
      violations.push(`${rel}:${line}: ${snippet}`);
    }
  }
  assert.deepEqual(
    violations,
    [],
    `Use catalogFmt (or catalogFmtOrUnit for byte/time unit suffixes) instead of English fallbacks:\n${violations.join('\n')}`
  );
});
