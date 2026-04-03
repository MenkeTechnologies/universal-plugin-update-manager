const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function maxSubarraySum(arr) {
  let best = -Infinity;
  let cur = 0;
  for (const x of arr) {
    cur = Math.max(x, cur + x);
    best = Math.max(best, cur);
  }
  return best;
}

describe('maxSubarraySum', () => {
  it('mixed', () => assert.strictEqual(maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4]), 6));
  it('all neg', () => assert.strictEqual(maxSubarraySum([-3, -1]), -1));
});
