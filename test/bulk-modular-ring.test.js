const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const P = 10009;

function mod(a) {
  let x = a % P;
  if (x < 0) x += P;
  return x;
}

describe('bulk mod arithmetic mod prime P', () => {
  it('additive inverses and double negation', () => {
    for (let a = 0; a < P; a++) {
      assert.strictEqual(mod(a + (P - a)), 0);
    }
    for (let a = 0; a < 5000; a++) {
      assert.strictEqual(mod(-mod(-a)), mod(a));
    }
  });
});
