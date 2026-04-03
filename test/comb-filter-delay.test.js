const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function comb(x, D, g) {
  const y = new Array(x.length).fill(0);
  for (let n = 0; n < x.length; n++) {
    y[n] = x[n] - (n >= D ? g * x[n - D] : 0);
  }
  return y;
}

describe('comb', () => {
  it('impulse', () => {
    const x = new Array(8).fill(0);
    x[0] = 1;
    const y = comb(x, 2, 1);
    assert.strictEqual(y[0], 1);
    assert.strictEqual(y[2], -1);
  });
});
