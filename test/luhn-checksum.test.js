const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function luhnValid(digits) {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits[i];
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

describe('luhnValid', () => {
  it('known valid (test card pattern)', () =>
    assert.strictEqual(luhnValid([5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4]), true));
  it('invalid', () => assert.strictEqual(luhnValid([1, 2, 3, 4]), false));
});
