const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function canPartition(nums) {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (sum % 2) return false;
  const target = sum / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const x of nums) {
    for (let t = target; t >= x; t--) dp[t] = dp[t] || dp[t - x];
  }
  return dp[target];
}

describe('canPartition', () => {
  it('yes', () => assert.strictEqual(canPartition([1, 5, 11, 5]), true));
});
