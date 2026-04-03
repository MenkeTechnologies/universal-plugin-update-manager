const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Generic page slice: offset/limit pagination
function pageSlice(items, offset, limit) {
  if (offset < 0) offset = 0;
  return items.slice(offset, offset + limit);
}

describe('pageSlice', () => {
  const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  it('first page', () => {
    assert.deepStrictEqual(pageSlice(items, 0, 3), [0, 1, 2]);
  });

  it('offset', () => {
    assert.deepStrictEqual(pageSlice(items, 7, 5), [7, 8, 9]);
  });

  it('negative offset treated as 0', () => {
    assert.deepStrictEqual(pageSlice(items, -2, 2), [0, 1]);
  });

  it('empty', () => {
    assert.deepStrictEqual(pageSlice([], 0, 10), []);
  });
});
