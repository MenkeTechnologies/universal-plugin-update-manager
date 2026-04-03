const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const MAX = 5001;
const F = new Array(MAX + 1);
F[0] = 0n;
F[1] = 1n;
for (let i = 2; i <= MAX; i++) F[i] = F[i - 1] + F[i - 2];

describe('bulk Cassini F(n-1)*F(n+1) - F(n)^2 = (-1)^n', () => {
  it('n = 1..4999', () => {
    for (let n = 1; n < 5000; n++) {
      const lhs = F[n - 1] * F[n + 1] - F[n] * F[n];
      const rhs = BigInt(n % 2 === 0 ? 1 : -1);
      assert.strictEqual(lhs, rhs);
    }
  });
});
