const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (a >= c) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

describe('coinChange', () => {
  it('11', () => assert.strictEqual(coinChange([1, 2, 5], 11), 3));
});
