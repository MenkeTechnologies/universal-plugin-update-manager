const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function gcdBinary(a, b) {
  if (a === 0) return b;
  if (b === 0) return a;
  let shift = 0;
  while (((a | b) & 1) === 0) {
    a >>= 1;
    b >>= 1;
    shift++;
  }
  while ((a & 1) === 0) a >>= 1;
  do {
    while ((b & 1) === 0) b >>= 1;
    if (a > b) [a, b] = [b, a];
    b -= a;
  } while (b !== 0);
  return a << shift;
}

describe('gcdBinary', () => {
  it('matches euclid', () => assert.strictEqual(gcdBinary(48, 18), 6));
});
