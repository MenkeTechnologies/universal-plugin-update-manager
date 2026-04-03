const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sorted(arr) {
  return [...arr].sort((x, y) => x - y);
}

describe('bulk sort yields non-decreasing order', () => {
  it('8000 seeded random arrays', () => {
    for (let seed = 0; seed < 8000; seed++) {
      const rnd = mulberry32(seed ^ 0x9e3779b9);
      const len = (rnd() * 48) | 0;
      const arr = [];
      for (let i = 0; i < len; i++) arr.push((rnd() * 2000000) | 0);
      const s = sorted(arr);
      for (let i = 1; i < s.length; i++) assert.ok(s[i - 1] <= s[i]);
    }
  });
});
