const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function readU32LE(buf, off) {
  return (
    buf[off] | (buf[off + 1] << 8) | (buf[off + 2] << 16) | (buf[off + 3] << 24)
  ) >>> 0;
}

describe('readU32LE', () => {
  it('deadbeef', () => {
    const b = new Uint8Array([0xef, 0xbe, 0xad, 0xde]);
    assert.strictEqual(readU32LE(b, 0), 0xdeadbeef >>> 0);
  });
});
