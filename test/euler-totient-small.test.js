const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

function phi(n) {
  let c = 0;
  for (let k = 1; k < n; k++) if (gcd(k, n) === 1) c++;
  return c;
}

describe('phi', () => {
  it('12', () => assert.strictEqual(phi(12), 4));
});
