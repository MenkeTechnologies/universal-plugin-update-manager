/**
 * Real command-palette.js: filterPaletteItems empty-query gating and fuzzy + lazy plugin rows.
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts, defaultDocument } = require('./frontend-vm-harness.js');

function loadPaletteSandbox(extra = {}) {
  return loadFrontendScripts(['utils.js', 'command-palette.js'], {
    appFmt: (k) => k,
    toastFmt: (k) => k,
    showToast: () => {},
    switchTab: () => {},
    scanPlugins: () => {},
    scanAudioSamples: () => {},
    scanDawProjects: () => {},
    scanPresets: () => {},
    checkUpdates: () => {},
    showDuplicateReport: () => {},
    resetAllScans: () => {},
    vstUpdater: {
      dbClearCaches: () => Promise.resolve(),
      clearLog: () => Promise.resolve(),
      getPrefsPath: () => Promise.resolve('/tmp/preferences.toml'),
      openPluginFolder: () => {},
      openWithApp: () => Promise.resolve(),
      openPrefsFile: () => {},
    },
    document: {
      ...defaultDocument(),
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      body: { insertAdjacentHTML: () => {} },
      addEventListener: () => {},
    },
    ...extra,
  });
}

describe('frontend/js/command-palette.js filterPaletteItems (vm-loaded)', () => {
  let P;

  before(() => {
    P = loadPaletteSandbox({
      allPlugins: [
        { name: 'Serum', type: 'VST', manufacturer: 'Xfer', path: '/p' },
      ],
    });
  });

  it('empty query keeps only tab and action rows (drops bookmark/tag/etc.)', () => {
    const items = [
      { type: 'bookmark', name: 'Dir', fields: ['Dir', '/tmp'] },
      { type: 'tab', name: 'Plugins' },
      { type: 'action', name: 'Scan' },
      { type: 'tag', name: 'drums', fields: ['drums'] },
    ];
    const out = P.filterPaletteItems('', items);
    assert.strictEqual(out.length, 2);
    assert.strictEqual(out.map((i) => i.type).sort().join(','), 'action,tab');
  });

  it('non-empty query scores items by fuzzy name fields', () => {
    const items = [
      { type: 'action', name: 'Export plugins', fields: ['Export plugins'] },
      { type: 'action', name: 'Import samples', fields: ['Import samples'] },
    ];
    const out = P.filterPaletteItems('export', items);
    assert.strictEqual(out.length, 1);
    assert.strictEqual(out[0].name, 'Export plugins');
  });

  it('with query length >= 2, merges in matching plugins from allPlugins', () => {
    const items = [{ type: 'tab', name: 'Tabs only' }];
    const out = P.filterPaletteItems('ser', items);
    const pluginRow = out.find((i) => i.type === 'plugin');
    assert.ok(pluginRow);
    assert.strictEqual(pluginRow.name, 'Serum');
  });
});
