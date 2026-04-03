const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function upperBound(arr, x) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

describe('upperBound', () => {
  it('after duplicates', () => {
    assert.strictEqual(upperBound([1, 2, 2, 2, 3], 2), 4);
  });
});
