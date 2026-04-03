const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function topN(arr, n, keyFn) {
  return [...arr].sort((a, b) => keyFn(b) - keyFn(a)).slice(0, n);
}

describe('topN', () => {
  it('by numeric field', () => {
    const r = topN(
      [
        { id: 'a', c: 1 },
        { id: 'b', c: 9 },
        { id: 'c', c: 5 },
      ],
      2,
      x => x.c
    );
    assert.deepStrictEqual(r.map(x => x.id), ['b', 'c']);
  });
});
