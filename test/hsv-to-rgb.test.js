const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: r + m, g: g + m, b: b + m };
}

describe('hsvToRgb', () => {
  it('red primary', () => {
    const { r, g, b } = hsvToRgb(0, 1, 1);
    assert.ok(r > 0.99 && g < 0.01 && b < 0.01);
  });

  it('white', () => {
    const { r, g, b } = hsvToRgb(0, 0, 1);
    assert.ok(Math.abs(r - 1) < 1e-9 && Math.abs(g - 1) < 1e-9);
  });
});
