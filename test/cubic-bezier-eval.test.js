const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function cubicBezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
}

describe('cubicBezier', () => {
  it('ends', () => {
    assert.strictEqual(cubicBezier(0, 0, 0, 1, 0), 0);
    assert.strictEqual(cubicBezier(0, 0, 0, 1, 1), 1);
  });
});
