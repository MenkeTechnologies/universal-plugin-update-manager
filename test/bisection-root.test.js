const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function bisection(f, lo, hi, eps = 1e-10) {
  let a = lo;
  let b = hi;
  if (f(a) * f(b) > 0) return NaN;
  while (b - a > eps) {
    const m = (a + b) / 2;
    if (f(m) === 0) return m;
    if (f(a) * f(m) < 0) b = m;
    else a = m;
  }
  return (a + b) / 2;
}

describe('bisection', () => {
  it('sqrt2', () => assert.ok(Math.abs(bisection(x => x * x - 2, 0, 2) - Math.SQRT2) < 1e-6));
});
