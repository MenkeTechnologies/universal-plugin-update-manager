const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function flattenDepth(arr, depth) {
  if (depth <= 0) return arr.slice();
  return arr.reduce((acc, x) => {
    if (Array.isArray(x)) acc.push(...flattenDepth(x, depth - 1));
    else acc.push(x);
    return acc;
  }, []);
}

describe('flattenDepth', () => {
  it('depth 1', () => {
    assert.deepStrictEqual(flattenDepth([[1], [2]], 1), [1, 2]);
  });

  it('depth 0', () => {
    assert.deepStrictEqual(flattenDepth([[1]], 0), [[1]]);
  });
});
