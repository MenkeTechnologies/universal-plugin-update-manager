const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/columns.js loadColumnWidths / COL_LAYOUT_VERSION ──
const COL_LAYOUT_VERSION = 3;

function parseSavedColumnWidths(entry) {
  if (!entry) return null;
  if (Array.isArray(entry)) return null;
  if (entry.v !== COL_LAYOUT_VERSION) return null;
  return entry.pcts || null;
}

describe('parseSavedColumnWidths', () => {
  it('returns pcts when version matches', () => {
    assert.deepStrictEqual(
      parseSavedColumnWidths({ v: 3, keys: ['a'], pcts: [25, 75] }),
      [25, 75]
    );
  });

  it('null for missing', () => {
    assert.strictEqual(parseSavedColumnWidths(null), null);
  });

  it('null for legacy array format', () => {
    assert.strictEqual(parseSavedColumnWidths([10, 20]), null);
  });

  it('null for stale version', () => {
    assert.strictEqual(parseSavedColumnWidths({ v: 2, pcts: [50] }), null);
  });

  it('null when pcts missing', () => {
    assert.strictEqual(parseSavedColumnWidths({ v: 3, keys: [] }), null);
  });
});
