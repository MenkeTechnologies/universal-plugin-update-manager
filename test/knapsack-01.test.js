const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function knapsack(weights, values, cap) {
  const n = weights.length;
  const dp = new Array(cap + 1).fill(0);
  for (let i = 0; i < n; i++) {
    for (let w = cap; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[cap];
}

describe('knapsack 0/1', () => {
  it('sample', () => assert.strictEqual(knapsack([1, 2, 3], [6, 10, 12], 5), 22));
});
