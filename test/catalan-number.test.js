const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function catalanDp(n) {
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) dp[i] += dp[j] * dp[i - 1 - j];
  }
  return dp[n];
}

describe('catalan', () => {
  it('dp small', () => assert.strictEqual(catalanDp(4), 14));
});
