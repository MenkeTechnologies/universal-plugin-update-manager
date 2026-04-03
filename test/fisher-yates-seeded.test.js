const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function lcg(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
}

function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

describe('shuffle deterministic', () => {
  it('same seed same order', () => {
    const a = [0, 1, 2, 3, 4, 5, 6, 7];
    const s1 = shuffle(a, lcg(12345));
    const s2 = shuffle(a, lcg(12345));
    assert.deepStrictEqual(s1, s2);
  });

  it('permutes', () => {
    const s = shuffle([0, 1, 2, 3, 4], lcg(999));
    assert.strictEqual(new Set(s).size, 5);
  });
});
