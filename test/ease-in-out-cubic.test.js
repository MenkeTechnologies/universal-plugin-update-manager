const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

describe('easeInOutCubic', () => {
  it('endpoints', () => {
    assert.strictEqual(easeInOutCubic(0), 0);
    assert.strictEqual(easeInOutCubic(1), 1);
  });

  it('mid', () => assert.ok(easeInOutCubic(0.5) > 0.4 && easeInOutCubic(0.5) < 0.6));
});
