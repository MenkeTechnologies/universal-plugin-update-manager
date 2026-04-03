const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function chunk(arr, size) {
  if (size <= 0) return [];
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

describe('chunk', () => {
  it('splits evenly', () => {
    assert.deepStrictEqual(chunk([1, 2, 3, 4], 2), [[1, 2], [3, 4]]);
  });

  it('remainder', () => {
    assert.deepStrictEqual(chunk([1, 2, 3], 2), [[1, 2], [3]]);
  });

  it('empty', () => {
    assert.deepStrictEqual(chunk([], 5), []);
  });

  it('size larger than array', () => {
    assert.deepStrictEqual(chunk([1], 10), [[1]]);
  });

  it('invalid size', () => {
    assert.deepStrictEqual(chunk([1, 2, 3], 0), []);
  });
});
