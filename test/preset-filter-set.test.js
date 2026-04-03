const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/presets.js fetchPresetPage format filter ──
function singleFormatFromMultiSet(fmtSet) {
  if (fmtSet && fmtSet.size === 1) return [...fmtSet][0];
  return null;
}

describe('singleFormatFromMultiSet', () => {
  it('null when all formats', () => {
    assert.strictEqual(singleFormatFromMultiSet(null), null);
    assert.strictEqual(singleFormatFromMultiSet(new Set()), null);
  });

  it('null when multiple selected', () => {
    assert.strictEqual(singleFormatFromMultiSet(new Set(['FXP', 'H2P'])), null);
  });

  it('returns sole format', () => {
    assert.strictEqual(singleFormatFromMultiSet(new Set(['FXP'])), 'FXP');
  });
});
