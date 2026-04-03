const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function nthRoot(x, n, eps = 1e-12) {
  if (x < 0 && n % 2 === 0) return NaN;
  if (x === 0) return 0;
  let r = x > 0 ? x : -x;
  let y = Math.pow(r, 1 / n);
  for (let i = 0; i < 50; i++) {
    const ny = ((n - 1) * y + r / Math.pow(y, n - 1)) / n;
    if (Math.abs(ny - y) < eps) {
      y = ny;
      break;
    }
    y = ny;
  }
  return x < 0 ? -y : y;
}

describe('nthRoot', () => {
  it('cube', () => assert.ok(Math.abs(nthRoot(27, 3) - 3) < 1e-9));
});
