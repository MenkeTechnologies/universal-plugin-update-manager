const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/shortcuts.js getShortcuts merge ──
const DEFAULT_SHORTCUTS = {
  tab1: { key: '1', mod: true, label: 'Plugins tab' },
  search: { key: 'f', mod: true, label: 'Focus search' },
};

function mergeShortcuts(saved) {
  const merged = { ...DEFAULT_SHORTCUTS };
  for (const [id, val] of Object.entries(saved || {})) {
    if (merged[id]) {
      merged[id] = { ...merged[id], key: val.key, mod: val.mod };
    }
  }
  return merged;
}

describe('mergeShortcuts', () => {
  it('returns defaults when saved null', () => {
    assert.deepStrictEqual(mergeShortcuts(null), DEFAULT_SHORTCUTS);
  });

  it('overrides key only for known ids', () => {
    const m = mergeShortcuts({ search: { key: 'g', mod: false } });
    assert.strictEqual(m.search.key, 'g');
    assert.strictEqual(m.search.mod, false);
    assert.strictEqual(m.search.label, 'Focus search');
  });

  it('ignores unknown ids', () => {
    const m = mergeShortcuts({ unknown: { key: 'z', mod: false } });
    assert.strictEqual(m.unknown, undefined);
  });
});
