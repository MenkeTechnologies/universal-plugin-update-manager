const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function integrateTrapz(xs, ys) {
  let s = 0;
  for (let i = 1; i < xs.length; i++) {
    const dx = xs[i] - xs[i - 1];
    s += 0.5 * (ys[i] + ys[i - 1]) * dx;
  }
  return s;
}

describe('integrateTrapz', () => {
  it('line y=x 0..1', () => {
    const xs = [0, 0.5, 1];
    const ys = [0, 0.5, 1];
    assert.ok(Math.abs(integrateTrapz(xs, ys) - 0.5) < 1e-9);
  });
});
