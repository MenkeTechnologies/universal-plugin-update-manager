const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function rk4(f, y0, t0, h, steps) {
  let y = y0;
  let t = t0;
  for (let i = 0; i < steps; i++) {
    const k1 = f(t, y);
    const k2 = f(t + h / 2, y + (h * k1) / 2);
    const k3 = f(t + h / 2, y + (h * k2) / 2);
    const k4 = f(t + h, y + h * k3);
    y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t += h;
  }
  return y;
}

describe('rk4', () => {
  it('exp', () => {
    const y = rk4((t, y) => y, 1, 0, 0.01, 100);
    assert.ok(Math.abs(y - Math.exp(1)) < 0.05);
  });
});
