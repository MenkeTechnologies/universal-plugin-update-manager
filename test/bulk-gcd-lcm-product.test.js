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

function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return (Math.abs(a) / gcd(a, b)) * Math.abs(b);
}

describe('bulk gcd(a,b)*lcm(a,b) === a*b for positive a,b', () => {
  it('all pairs a,b in [1,120]', () => {
    for (let a = 1; a <= 120; a++) {
      for (let b = 1; b <= 120; b++) {
        assert.strictEqual(gcd(a, b) * lcm(a, b), a * b);
      }
    }
  });
});
