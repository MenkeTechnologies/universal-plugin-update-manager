const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function binom(n, k) {
  if (k < 0 || k > n) return 0n;
  if (k > n - k) k = n - k;
  let r = 1n;
  for (let i = 1; i <= k; i++) r = (r * BigInt(n - k + i)) / BigInt(i);
  return r;
}

describe('bulk C(n,k) === C(n,n-k)', () => {
  it('all n in [0,150], k in [0,n]', () => {
    for (let n = 0; n <= 150; n++) {
      for (let k = 0; k <= n; k++) {
        assert.strictEqual(binom(n, k), binom(n, n - k));
      }
    }
  });
});
