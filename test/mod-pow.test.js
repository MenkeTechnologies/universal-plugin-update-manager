const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function modPow(base, exp, mod) {
  let r = 1 % mod;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e & 1) r = (r * b) % mod;
    b = (b * b) % mod;
    e >>= 1;
  }
  return r;
}

describe('modPow', () => {
  it('fermat', () => assert.strictEqual(modPow(2, 10, 1000), 24));
  it('mod 1', () => assert.strictEqual(modPow(7, 99, 1), 0));
});
