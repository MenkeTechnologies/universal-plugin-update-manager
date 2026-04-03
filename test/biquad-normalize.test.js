const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Normalize biquad coefficients so a0 = 1 (common DSP convention)
function normalizeBiquad(b0, b1, b2, a0, a1, a2) {
  if (a0 === 0) return null;
  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0,
  };
}

describe('normalizeBiquad', () => {
  it('scales', () => {
    const c = normalizeBiquad(2, 0, 0, 2, -1, 0);
    assert.deepStrictEqual(c, { b0: 1, b1: 0, b2: 0, a1: -0.5, a2: 0 });
  });

  it('zero a0', () => assert.strictEqual(normalizeBiquad(1, 0, 0, 0, 1, 0), null));
});
