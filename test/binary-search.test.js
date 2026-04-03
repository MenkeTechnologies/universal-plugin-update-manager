const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function lowerBound(arr, x) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

describe('lowerBound', () => {
  it('insert position', () => {
    assert.strictEqual(lowerBound([1, 3, 5, 7], 4), 2);
  });

  it('end', () => assert.strictEqual(lowerBound([1, 2], 9), 2));
});
