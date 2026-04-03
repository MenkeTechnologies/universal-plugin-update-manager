const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function popcount32(n) {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
}

describe('popcount32', () => {
  it('powers', () => assert.strictEqual(popcount32(0b1011), 3));
});
