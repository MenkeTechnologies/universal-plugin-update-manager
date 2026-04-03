const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function gcd(a, b) {
  a = Math.abs(a | 0);
  b = Math.abs(b | 0);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

describe('bulk gcd(a,b) === gcd(b,a)', () => {
  it('all pairs a,b in [0,99]', () => {
    for (let a = 0; a < 100; a++) {
      for (let b = 0; b < 100; b++) {
        assert.strictEqual(gcd(a, b), gcd(b, a));
      }
    }
  });
});
