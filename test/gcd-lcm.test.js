const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 0;
}

function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcd(a, b)) * b);
}

describe('gcd', () => {
  it('coprime', () => assert.strictEqual(gcd(17, 13), 1));
  it('common', () => assert.strictEqual(gcd(48, 18), 6));
});

describe('lcm', () => {
  it('basic', () => assert.strictEqual(lcm(4, 6), 12));
});
