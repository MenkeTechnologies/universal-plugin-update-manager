const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Default shortcuts subset + merge (frontend/js/shortcuts.js) ──
const DEFAULT_SHORTCUTS = {
  tab1: { key: '1', mod: true, label: 'Plugins tab' },
  tab12: { key: 'F4', mod: false, label: 'Visualizer tab' },
  tab13: { key: 'F5', mod: false, label: 'Walkers tab' },
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

// Mirrors frontend/js/shortcuts.js TAB_MAP (plugins … settings)
const TAB_MAP = [
  'plugins', 'samples', 'daw', 'presets', 'midi', 'pdf', 'favorites', 'notes', 'tags', 'files',
  'history', 'visualizer', 'walkers', 'settings',
];

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
      { tab1: { key: 'q', mod: false }, tab12: { key: 'w', mod: true } },
      DEFAULT_SHORTCUTS
    );
    assert.strictEqual(m.tab1.key, 'q');
    assert.strictEqual(m.tab12.key, 'w');
    assert.strictEqual(m.tab12.mod, true);
  });
});

describe('tabSlugFromShortcutId', () => {
  it('maps tab1 to plugins', () => {
    assert.strictEqual(tabSlugFromShortcutId('tab1'), 'plugins');
  });

  it('maps tab12 to visualizer', () => {
    assert.strictEqual(tabSlugFromShortcutId('tab12'), 'visualizer');
  });

  it('maps tab13 to walkers', () => {
    assert.strictEqual(tabSlugFromShortcutId('tab13'), 'walkers');
  });

  it('settings is last slug at index 13 (tab14 not defined in defaults)', () => {
    assert.strictEqual(TAB_MAP[13], 'settings');
  });

  it('maps tab6 to pdf', () => {
    assert.strictEqual(tabSlugFromShortcutId('tab6'), 'pdf');
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
  it('has 14 entries matching tab1..tab14 range', () => {
    assert.strictEqual(TAB_MAP.length, 14);
  });

  it('settings is last', () => {
    assert.strictEqual(TAB_MAP[TAB_MAP.length - 1], 'settings');
  });
});
