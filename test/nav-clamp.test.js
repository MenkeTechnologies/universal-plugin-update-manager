const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Same bounds as frontend/js/keyboard-nav.js setNavIndex ──
function clampNavIndex(idx, len) {
  if (len === 0) return -1;
  return Math.max(0, Math.min(idx, len - 1));
}

describe('clampNavIndex', () => {
  it('clamps high', () => {
    assert.strictEqual(clampNavIndex(100, 5), 4);
  });

  it('clamps low', () => {
    assert.strictEqual(clampNavIndex(-5, 5), 0);
  });

  it('unchanged in range', () => {
    assert.strictEqual(clampNavIndex(2, 10), 2);
  });

  it('single item', () => {
    assert.strictEqual(clampNavIndex(0, 1), 0);
    assert.strictEqual(clampNavIndex(5, 1), 0);
  });

  it('zero length convention', () => {
    assert.strictEqual(clampNavIndex(0, 0), -1);
  });
});
