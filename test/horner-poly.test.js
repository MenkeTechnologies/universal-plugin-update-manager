const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function horner(coeffs, x) {
  let v = 0;
  for (let i = 0; i < coeffs.length; i++) v = v * x + coeffs[i];
  return v;
}

describe('horner', () => {
  it('quadratic', () => {
    // x^2 + 2x + 3 at x=2 => 4+4+3=11
    assert.strictEqual(horner([1, 2, 3], 2), 11);
  });
});
