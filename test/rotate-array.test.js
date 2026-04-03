const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function rotateLeft(arr, k) {
  const n = arr.length;
  if (n === 0) return [];
  const kk = ((k % n) + n) % n;
  return arr.slice(kk).concat(arr.slice(0, kk));
}

describe('rotateLeft', () => {
  it('by 2', () => assert.deepStrictEqual(rotateLeft([1, 2, 3, 4, 5], 2), [3, 4, 5, 1, 2]));

  it('negative is right rotation', () => {
    assert.deepStrictEqual(rotateLeft([1, 2, 3], -1), [3, 1, 2]);
  });
});
