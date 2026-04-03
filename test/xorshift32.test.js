const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function xorshift32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0x100000000;
  };
}

describe('xorshift32', () => {
  it('deterministic', () => {
    const a = xorshift32(12345);
    const b = xorshift32(12345);
    assert.strictEqual(a(), b());
    assert.strictEqual(a(), b());
  });
});
