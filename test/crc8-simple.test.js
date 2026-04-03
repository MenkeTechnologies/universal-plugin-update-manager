const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function crc8(data) {
  let c = 0;
  for (let i = 0; i < data.length; i++) {
    c ^= data.charCodeAt(i);
    for (let b = 0; b < 8; b++) c = c & 0x80 ? (c << 1) ^ 0x07 : c << 1;
    c &= 0xff;
  }
  return c;
}

describe('crc8', () => {
  it('deterministic', () => assert.strictEqual(crc8('hello'), crc8('hello')));
  it('differs', () => assert.notStrictEqual(crc8('a'), crc8('b')));
});
