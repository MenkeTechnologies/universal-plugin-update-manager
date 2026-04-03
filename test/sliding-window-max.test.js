const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function slidingWindowMax(arr, k) {
  if (k <= 0 || arr.length === 0) return [];
  const out = [];
  const dq = [];
  for (let i = 0; i < arr.length; i++) {
    while (dq.length && dq[0] <= i - k) dq.shift();
    while (dq.length && arr[dq[dq.length - 1]] <= arr[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) out.push(arr[dq[0]]);
  }
  return out;
}

describe('slidingWindowMax', () => {
  it('example', () => {
    assert.deepStrictEqual(slidingWindowMax([1, 3, -1, -3, 5, 3, 6, 7], 3), [3, 3, 5, 5, 6, 7]);
  });
});
