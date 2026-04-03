const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function rotl32(x, k) {
  return ((x << k) | (x >>> (32 - k))) >>> 0;
}

describe('rotl32', () => {
  it('one', () => assert.strictEqual(rotl32(0x80000000, 1), 1));
});
