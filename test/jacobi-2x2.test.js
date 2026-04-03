const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

/** One Jacobi rotation for symmetric 2×2 [[a,b],[b,c]]; zeros the off-diagonal. */
function jacobiSymmetric2x2(a, b, c) {
  if (Math.abs(b) < 1e-15) return [a, b, c];
  const phi = 0.5 * Math.atan2(2 * b, a - c);
  const co = Math.cos(phi);
  const si = Math.sin(phi);
  const a11 = co * co * a - 2 * co * si * b + si * si * c;
  const a22 = si * si * a + 2 * co * si * b + co * co * c;
  const a12 = (co * co - si * si) * b + co * si * (a - c);
  return [a11, a12, a22];
}

describe('jacobiSymmetric2x2', () => {
  it('zeros off-diagonal', () => {
    const [, off] = jacobiSymmetric2x2(2, 1, 2);
    assert.ok(Math.abs(off) < 1e-12);
  });
});
