const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/ipc.js menu 'tab_*' payloads → switchTab(slug) ──
const MENU_TAB_TO_SLUG = {
  tab_plugins: 'plugins',
  tab_samples: 'samples',
  tab_daw: 'daw',
  tab_presets: 'presets',
  tab_favorites: 'favorites',
  tab_notes: 'notes',
  tab_history: 'history',
  tab_settings: 'settings',
  tab_files: 'files',
};

function slugFromMenuPayload(id) {
  return MENU_TAB_TO_SLUG[id] || null;
}

describe('MENU_TAB_TO_SLUG', () => {
  it('covers main tabs', () => {
    assert.strictEqual(slugFromMenuPayload('tab_plugins'), 'plugins');
    assert.strictEqual(slugFromMenuPayload('tab_samples'), 'samples');
    assert.strictEqual(slugFromMenuPayload('tab_settings'), 'settings');
  });

  it('unknown menu id', () => {
    assert.strictEqual(slugFromMenuPayload('scan_plugins'), null);
  });

  it('all values are non-empty strings', () => {
    for (const [k, v] of Object.entries(MENU_TAB_TO_SLUG)) {
      assert.ok(k.startsWith('tab_'));
      assert.ok(v.length > 0);
    }
  });
});
