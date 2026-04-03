const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function crtTwo(a1, m1, a2, m2) {
  // x ≡ a1 (mod m1), x ≡ a2 (mod m2), m1,m2 coprime
  for (let x = a1; x < m1 * m2; x += m1) {
    if (x % m2 === ((a2 % m2) + m2) % m2) return x;
  }
  return 0;
}

describe('crtTwo', () => {
  it('small', () => assert.strictEqual(crtTwo(2, 3, 3, 5), 8));
});
