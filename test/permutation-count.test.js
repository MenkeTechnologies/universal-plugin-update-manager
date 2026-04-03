const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function factorial(n) {
  let x = 1;
  for (let i = 2; i <= n; i++) x *= i;
  return x;
}

function nPk(n, k) {
  if (k < 0 || k > n) return 0;
  let x = 1;
  for (let i = 0; i < k; i++) x *= n - i;
  return x;
}

function nCk(n, k) {
  if (k < 0 || k > n) return 0;
  if (k > n / 2) k = n - k;
  let num = 1;
  let den = 1;
  for (let i = 1; i <= k; i++) {
    num *= n - (k - i);
    den *= i;
  }
  return Math.round(num / den);
}

describe('nPk / nCk', () => {
  it('perm', () => assert.strictEqual(nPk(5, 3), 60));
  it('comb', () => assert.strictEqual(nCk(5, 3), 10));
  it('relation', () => assert.strictEqual(nCk(6, 2), factorial(6) / (factorial(2) * factorial(4))));
});
