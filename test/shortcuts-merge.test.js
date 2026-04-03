const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Default shortcuts subset + merge (frontend/js/shortcuts.js) ──
const DEFAULT_SHORTCUTS = {
  tab1: { key: '1', mod: true, label: 'Plugins tab' },
  tab2: { key: '2', mod: true, label: 'Samples tab' },
  tab12: { key: 'F4', mod: false, label: 'Settings tab' },
  search: { key: 'f', mod: true, label: 'Focus search' },
  newKey: { key: 'x', mod: false, label: 'Future shortcut' },
};

function mergeShortcuts(saved, defaults) {
  const merged = { ...defaults };
  for (const [id, val] of Object.entries(saved)) {
    if (merged[id]) {
      merged[id] = { ...merged[id], key: val.key, mod: val.mod };
    }
  }
  return merged;
}

const TAB_MAP = ['plugins', 'samples', 'daw', 'presets', 'favorites', 'notes', 'tags', 'files', 'history', 'midi', 'visualizer', 'walkers', 'settings'];

function tabSlugFromShortcutId(id) {
  if (!id.startsWith('tab') || id.length < 4 || id.length > 5) return null;
  const num = parseInt(id.slice(3), 10);
  if (Number.isNaN(num)) return null;
  const idx = num - 1;
  if (idx < 0 || idx >= TAB_MAP.length) return null;
  return TAB_MAP[idx];
}

describe('mergeShortcuts', () => {
  it('returns defaults when saved is empty', () => {
    const m = mergeShortcuts({}, DEFAULT_SHORTCUTS);
    assert.strictEqual(m.search.key, 'f');
    assert.strictEqual(m.search.mod, true);
  });

  it('overrides key and mod only', () => {
    const m = mergeShortcuts({ search: { key: 'g', mod: false } }, DEFAULT_SHORTCUTS);
    assert.strictEqual(m.search.key, 'g');
    assert.strictEqual(m.search.mod, false);
    assert.strictEqual(m.search.label, 'Focus search');
  });

  it('ignores unknown shortcut ids in saved', () => {
    const m = mergeShortcuts({ unknown: { key: 'z', mod: true } }, DEFAULT_SHORTCUTS);
    assert.strictEqual(m.unknown, undefined);
  });

  it('does not add keys not in defaults', () => {
    const m = mergeShortcuts({ extra: { key: 'a', mod: false } }, DEFAULT_SHORTCUTS);
    assert.strictEqual(m.extra, undefined);
  });

  it('merges multiple ids', () => {
    const m = mergeShortcuts(
      { tab1: { key: 'q', mod: false }, tab2: { key: 'w', mod: true } },
      DEFAULT_SHORTCUTS
    );
    assert.strictEqual(m.tab1.key, 'q');
    assert.strictEqual(m.tab2.mod, true);
  });
});

describe('tabSlugFromShortcutId', () => {
  it('maps tab1 to plugins', () => {
    assert.strictEqual(tabSlugFromShortcutId('tab1'), 'plugins');
  });

  it('maps tab12 to walkers (TAB_MAP index 11)', () => {
    assert.strictEqual(tabSlugFromShortcutId('tab12'), 'walkers');
  });

  it('settings is last slug; reachable only at index 12 (no tab13 shortcut)', () => {
    assert.strictEqual(TAB_MAP[12], 'settings');
  });

  it('maps tab6 to notes', () => {
    assert.strictEqual(tabSlugFromShortcutId('tab6'), 'notes');
  });

  it('returns null for tab0', () => {
    assert.strictEqual(tabSlugFromShortcutId('tab0'), null);
  });

  it('returns null for tab99', () => {
    assert.strictEqual(tabSlugFromShortcutId('tab99'), null);
  });

  it('returns null for non-tab ids', () => {
    assert.strictEqual(tabSlugFromShortcutId('search'), null);
    assert.strictEqual(tabSlugFromShortcutId('tab'), null);
  });

  it('returns null for malformed', () => {
    assert.strictEqual(tabSlugFromShortcutId('tabxx'), null);
  });
});

describe('TAB_MAP', () => {
  it('has 13 entries matching tab1..tab12 + implicit range', () => {
    assert.strictEqual(TAB_MAP.length, 13);
  });

  it('settings is last', () => {
    assert.strictEqual(TAB_MAP[TAB_MAP.length - 1], 'settings');
  });
});
