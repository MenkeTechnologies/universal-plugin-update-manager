const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('bulk De Morgan on truncated ints', () => {
  it('a,b in [0,255] with 8-bit mask', () => {
    const m = 0xff;
    for (let a = 0; a < 256; a++) {
      for (let b = 0; b < 256; b++) {
        assert.strictEqual(~(a & b) & m, ((~a) | (~b)) & m);
        assert.strictEqual(~(a | b) & m, ((~a) & (~b)) & m);
      }
    }
  });
});
