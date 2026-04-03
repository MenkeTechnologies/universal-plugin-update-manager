const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function isqrt(n) {
  if (n < 0) return -1;
  let x = n;
  let y = (x + 1) >> 1;
  while (y < x) {
    x = y;
    y = (x + n / x) >> 1;
  }
  return x;
}

describe('isqrt', () => {
  it('perfect', () => assert.strictEqual(isqrt(144), 12));
  it('floor', () => assert.strictEqual(isqrt(15), 3));
});
