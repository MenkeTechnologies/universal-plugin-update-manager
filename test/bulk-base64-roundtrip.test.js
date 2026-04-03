const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
  };
}

describe('bulk Buffer base64 roundtrip', () => {
  it('6000 random buffers', () => {
    for (let seed = 0; seed < 6000; seed++) {
      const rnd = mulberry32(seed + 0xdeadbeef);
      const len = (rnd() % 200) + 1;
      const u8 = new Uint8Array(len);
      for (let i = 0; i < len; i++) u8[i] = rnd() & 0xff;
      const b64 = Buffer.from(u8).toString('base64');
      const back = Buffer.from(b64, 'base64');
      assert.deepStrictEqual([...back], [...u8]);
    }
  });
});
