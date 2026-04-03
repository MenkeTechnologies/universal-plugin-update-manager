const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function unique(arr) {
  return [...new Set(arr)];
}

function uniqueBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = keyFn(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

describe('unique', () => {
  it('dedupes primitives', () => {
    assert.deepStrictEqual(unique([1, 2, 1, 3]), [1, 2, 3]);
  });
});

describe('uniqueBy', () => {
  it('first wins', () => {
    assert.deepStrictEqual(
      uniqueBy([{ id: 1, a: 1 }, { id: 1, a: 2 }], x => x.id),
      [{ id: 1, a: 1 }]
    );
  });
});
