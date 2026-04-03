const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function sqrtNewton(S, eps = 1e-12) {
  if (S < 0) return NaN;
  if (S === 0) return 0;
  let x = S;
  while (true) {
    const nx = 0.5 * (x + S / x);
    if (Math.abs(nx - x) < eps) return nx;
    x = nx;
  }
}

describe('sqrtNewton', () => {
  it('two', () => assert.ok(Math.abs(sqrtNewton(2) - Math.SQRT2) < 1e-10));
  it('zero', () => assert.strictEqual(sqrtNewton(0), 0));
});
