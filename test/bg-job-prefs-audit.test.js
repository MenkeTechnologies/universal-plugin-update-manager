/**
 * Background job toggles in Settings → Scan behavior persist via `prefs.setItem` / `prefs.getItem`
 * (file-backed in Rust). This test locks the contract so new toggles are not added only in HTML.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsDir = join(root, 'frontend', 'js');

/** Scan-behavior startup toggles for background work (badges / deferred jobs). Order: UX listing. */
const STARTUP_BG_JOB_PREFS = [
  {
    key: 'autoAnalysis',
    toggleFn: 'settingToggleAutoAnalysis',
    /** Must read pref outside settings.js for runtime behavior */
    minConsumersOutsideSettings: 1,
  },
  {
    key: 'autoContentDupScan',
    toggleFn: 'settingToggleAutoContentDupScan',
    minConsumersOutsideSettings: 1,
  },
  {
    key: 'autoFingerprintCache',
    toggleFn: 'settingToggleAutoFingerprintCache',
    minConsumersOutsideSettings: 1,
  },
  {
    key: 'autoPdfScanOnStartup',
    toggleFn: 'settingToggleAutoPdfScanOnStartup',
    minConsumersOutsideSettings: 1,
  },
  {
    key: 'autoPdfMetadataOnStartup',
    toggleFn: 'settingToggleAutoPdfMetadataOnStartup',
    minConsumersOutsideSettings: 1,
  },
  {
    key: 'autoCheckUpdatesOnStartup',
    toggleFn: 'settingToggleAutoCheckUpdatesOnStartup',
    minConsumersOutsideSettings: 1,
  },
];

function readJsFiles() {
  return readdirSync(jsDir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.js'))
    .map((d) => join(jsDir, d.name));
}

function countMatches(src, re) {
  let n = 0;
  re.lastIndex = 0;
  while (re.exec(src) !== null) n++;
  return n;
}

test('each startup background-job pref: setItem in settings.js, getItem elsewhere, ipc + HTML wired', () => {
  const settingsSrc = readFileSync(join(jsDir, 'settings.js'), 'utf8');
  const ipcSrc = readFileSync(join(jsDir, 'ipc.js'), 'utf8');
  const html = readFileSync(join(root, 'frontend', 'index.html'), 'utf8');
  const jsFiles = readJsFiles();

  for (const { key, toggleFn, minConsumersOutsideSettings } of STARTUP_BG_JOB_PREFS) {
    const setRe = new RegExp(`prefs\\.setItem\\(\\s*['"]${key}['"]`, 'g');
    assert.equal(
      countMatches(settingsSrc, setRe),
      1,
      `${key}: expected exactly one prefs.setItem in settings.js`
    );

    const getRe = new RegExp(`prefs\\.getItem\\(\\s*['"]${key}['"]`, 'g');
    let outside = 0;
    for (const f of jsFiles) {
      if (f.endsWith('/settings.js')) continue;
      const c = readFileSync(f, 'utf8');
      outside += countMatches(c, getRe);
    }
    assert.ok(
      outside >= minConsumersOutsideSettings,
      `${key}: expected getItem in at least ${minConsumersOutsideSettings} non-settings JS file(s), got ${outside}`
    );

    assert.match(
      ipcSrc,
      new RegExp(`case\\s+['"]${toggleFn}['"]`),
      `${key}: ipc.js must dispatch data-action → ${toggleFn}`
    );

    assert.match(
      html,
      new RegExp(`data-action\\s*=\\s*['"]${toggleFn}['"]`),
      `${key}: index.html must expose ${toggleFn}`
    );
  }
});

/** Background PDF page resolution while the PDF tab is open (not only at startup). */
test('pdfMetadataAutoExtract pref wired like other background toggles', () => {
  const key = 'pdfMetadataAutoExtract';
  const toggleFn = 'settingTogglePdfMetadataAutoExtract';
  const settingsSrc = readFileSync(join(jsDir, 'settings.js'), 'utf8');
  const ipcSrc = readFileSync(join(jsDir, 'ipc.js'), 'utf8');
  const html = readFileSync(join(root, 'frontend', 'index.html'), 'utf8');
  const pdfSrc = readFileSync(join(jsDir, 'pdf.js'), 'utf8');

  const setRe = new RegExp(`prefs\\.setItem\\(\\s*['"]${key}['"]`, 'g');
  assert.equal(countMatches(settingsSrc, setRe), 1, `${key}: one setItem in settings.js`);

  const getRe = new RegExp(`prefs\\.getItem\\(\\s*['"]${key}['"]`, 'g');
  assert.ok(countMatches(pdfSrc, getRe) >= 1, `${key}: pdf.js should read pref`);

  assert.match(ipcSrc, new RegExp(`case\\s+['"]${toggleFn}['"]`), 'ipc dispatches PDF metadata auto toggle');
  assert.match(html, new RegExp(`data-action\\s*=\\s*['"]${toggleFn}['"]`), 'HTML exposes PDF metadata auto toggle');
});
