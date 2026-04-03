const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Equal-power pan: L = cos(p * π/2), R = sin(p * π/2), p in [0,1] left to right
function panCoeffs(p) {
  const t = (p * Math.PI) / 2;
  return { L: Math.cos(t), R: Math.sin(t) };
}

describe('panCoeffs', () => {
  it('center', () => {
    const { L, R } = panCoeffs(0.5);
    assert.ok(Math.abs(L - R) < 0.01);
  });

  it('energy ~1', () => {
    const { L, R } = panCoeffs(0.3);
    assert.ok(Math.abs(L * L + R * R - 1) < 1e-9);
  });
});
