const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function onePoleLP(x, a) {
  const y = new Array(x.length);
  y[0] = x[0];
  for (let i = 1; i < x.length; i++) y[i] = a * x[i] + (1 - a) * y[i - 1];
  return y;
}

describe('onePoleLP', () => {
  it('dc', () => {
    const y = onePoleLP([1, 1, 1, 1], 0.5);
    assert.ok(Math.abs(y[y.length - 1] - 1) < 1e-9);
  });
});
