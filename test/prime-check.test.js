const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  const L = Math.sqrt(n);
  for (let i = 3; i <= L; i += 2) if (n % i === 0) return false;
  return true;
}

describe('isPrime', () => {
  it('small', () => {
    assert.strictEqual(isPrime(2), true);
    assert.strictEqual(isPrime(17), true);
    assert.strictEqual(isPrime(18), false);
  });
});
