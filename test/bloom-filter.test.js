const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function bloomCreate(bits, seeds) {
  const buf = new Uint8Array((bits + 7) >> 3);
  const hasher = (s, seed) => {
    let h = seed;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x9e3779b9);
    return (h >>> 0) % bits;
  };
  return {
    bits,
    buf,
    seeds,
    add(s) {
      for (const seed of seeds) {
        const i = hasher(s, seed);
        buf[i >> 3] |= 1 << (i & 7);
      }
    },
    maybeHas(s) {
      for (const seed of seeds) {
        const i = hasher(s, seed);
        if (((buf[i >> 3] >> (i & 7)) & 1) === 0) return false;
      }
      return true;
    },
  };
}

describe('BloomFilter', () => {
  it('member', () => {
    const b = bloomCreate(256, [1, 2, 3]);
    b.add('plugin');
    assert.strictEqual(b.maybeHas('plugin'), true);
    assert.strictEqual(b.maybeHas('missing'), false);
  });
});
