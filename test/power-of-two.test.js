const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

function nextPowerOfTwo(n) {
  if (n <= 1) return 1;
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

describe('isPowerOfTwo', () => {
  it('true', () => assert.strictEqual(isPowerOfTwo(1024), true));
  it('false', () => assert.strictEqual(isPowerOfTwo(1000), false));
});

describe('nextPowerOfTwo', () => {
  it('exact', () => assert.strictEqual(nextPowerOfTwo(16), 16));
  it('between', () => assert.strictEqual(nextPowerOfTwo(17), 32));
});
