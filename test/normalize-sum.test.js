const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function normalizeToSumOne(weights) {
  const s = weights.reduce((a, b) => a + b, 0);
  if (s === 0) return weights.map(() => 0);
  return weights.map(w => w / s);
}

describe('normalizeToSumOne', () => {
  it('sums to 1', () => {
    const n = normalizeToSumOne([1, 2, 3]);
    assert.ok(Math.abs(n.reduce((a, b) => a + b, 0) - 1) < 1e-9);
  });
});
