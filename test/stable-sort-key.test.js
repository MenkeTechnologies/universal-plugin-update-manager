const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function sortByStable(arr, keyFn) {
  return arr
    .map((x, i) => ({ x, i }))
    .sort((a, b) => {
      const ka = keyFn(a.x);
      const kb = keyFn(b.x);
      if (ka < kb) return -1;
      if (ka > kb) return 1;
      return a.i - b.i;
    })
    .map(o => o.x);
}

describe('sortByStable', () => {
  it('preserves order for equal keys', () => {
    const a = [
      { k: 1, t: 'a' },
      { k: 2, t: 'b' },
      { k: 1, t: 'c' },
    ];
    const s = sortByStable(a, x => x.k);
    assert.deepStrictEqual(
      s.map(x => x.t),
      ['a', 'c', 'b']
    );
  });
});
