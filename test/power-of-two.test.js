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
  it('1', () => assert.strictEqual(isPowerOfTwo(1), true));
  it('0', () => assert.strictEqual(isPowerOfTwo(0), false));
  it('negative', () => assert.strictEqual(isPowerOfTwo(-1), false));
  it('2', () => assert.strictEqual(isPowerOfTwo(2), true));
  it('4', () => assert.strictEqual(isPowerOfTwo(4), true));
  it('8', () => assert.strictEqual(isPowerOfTwo(8), true));
  it('16', () => assert.strictEqual(isPowerOfTwo(16), true));
  it('32', () => assert.strictEqual(isPowerOfTwo(32), true));
  it('64', () => assert.strictEqual(isPowerOfTwo(64), true));
  it('128', () => assert.strictEqual(isPowerOfTwo(128), true));
  it('256', () => assert.strictEqual(isPowerOfTwo(256), true));
  it('512', () => assert.strictEqual(isPowerOfTwo(512), true));
  it('1024', () => assert.strictEqual(isPowerOfTwo(1024), true));
  it('2048', () => assert.strictEqual(isPowerOfTwo(2048), true));
  it('4096', () => assert.strictEqual(isPowerOfTwo(4096), true));
});

describe('nextPowerOfTwo', () => {
  it('exact', () => assert.strictEqual(nextPowerOfTwo(16), 16));
  it('between', () => assert.strictEqual(nextPowerOfTwo(17), 32));
  it('1', () => assert.strictEqual(nextPowerOfTwo(1), 1));
  it('0', () => assert.strictEqual(nextPowerOfTwo(0), 1));
  it('negative', () => assert.strictEqual(nextPowerOfTwo(-1), 1));
  it('255', () => assert.strictEqual(nextPowerOfTwo(255), 256));
  it('256', () => assert.strictEqual(nextPowerOfTwo(256), 256));
  it('511', () => assert.strictEqual(nextPowerOfTwo(511), 512));
  it('512', () => assert.strictEqual(nextPowerOfTwo(512), 512));
  it('1024', () => assert.strictEqual(nextPowerOfTwo(1024), 1024));
  it('1025', () => assert.strictEqual(nextPowerOfTwo(1025), 2048));
  it('2048', () => assert.strictEqual(nextPowerOfTwo(2048), 2048));
  it('2049', () => assert.strictEqual(nextPowerOfTwo(2049), 4096));
  it('1048576', () => assert.strictEqual(nextPowerOfTwo(1048576), 1048576));
});
