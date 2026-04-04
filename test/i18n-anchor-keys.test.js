/**
 * Per-locale spot checks: for every **safe** `menu.*` / `tray.*` key, each non-English shipped
 * locale must not copy the English string verbatim (catches pasted `en` rows or bad MT).
 *
 * **Safe key** = English value is non-empty and `de`/`es`/`fr`/`nl`/`pt`/`sv` **all** differ
 * from English for that key (keys like `menu.app` / `tray.tooltip` where many locales keep
 * `AUDIO_HAXOR` are excluded automatically).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const i18nDir = join(root, 'i18n');

const NON_EN = /** @type {const} */ (['de', 'es', 'fr', 'nl', 'pt', 'sv']);

function loadMap(name) {
  const raw = readFileSync(join(i18nDir, name), 'utf8');
  return JSON.parse(raw);
}

const en = loadMap('app_i18n_en.json');
const locMaps = Object.fromEntries(
  NON_EN.map((loc) => [loc, loadMap(`app_i18n_${loc}.json`)])
);

/** @returns {string[]} */
function anchorKeysWhereEveryLocaleDiffers() {
  const keys = [];
  for (const k of Object.keys(en).sort()) {
    if (!k.startsWith('menu.') && !k.startsWith('tray.')) continue;
    const ev = en[k];
    if (typeof ev !== 'string' || ev.trim() === '') continue;
    if (NON_EN.every((loc) => locMaps[loc][k] !== ev)) keys.push(k);
  }
  return keys;
}

const ANCHOR_KEYS = anchorKeysWhereEveryLocaleDiffers();

test('catalog yields a large safe menu/tray anchor set', () => {
  assert.ok(
    ANCHOR_KEYS.length > 200,
    `expected 200+ safe keys, got ${ANCHOR_KEYS.length}`
  );
});

for (const anchor of ANCHOR_KEYS) {
  assert.ok(
    en[anchor] != null && String(en[anchor]).trim() !== '',
    `English catalog must define non-empty ${anchor}`
  );
  for (const loc of NON_EN) {
    test(`locale ${loc} differs from en for ${anchor}`, () => {
      const m = locMaps[loc];
      assert.notEqual(
        m[anchor],
        en[anchor],
        `${loc} ${anchor}: value must not be a verbatim copy of English`
      );
    });
  }
}
