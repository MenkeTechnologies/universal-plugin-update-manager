const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

/** CSS Color 4 style: h degrees, w/b in [0,1] */
function hwbToRgb(h, w, b) {
  h = ((h % 360) + 360) % 360;
  const rgb = hslToRgb(h, 1, 0.5);
  const sum = w + b;
  if (sum >= 1) {
    const g = w / sum;
    return [g, g, g];
  }
  return rgb.map(c => c * (1 - w - b) + w);
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b0 = 0;
  if (hp >= 0 && hp < 1) [r, g, b0] = [c, x, 0];
  else if (hp < 2) [r, g, b0] = [x, c, 0];
  else if (hp < 3) [r, g, b0] = [0, c, x];
  else if (hp < 4) [r, g, b0] = [0, x, c];
  else if (hp < 5) [r, g, b0] = [x, 0, c];
  else [r, g, b0] = [c, 0, x];
  const m = l - c / 2;
  return [r + m, g + m, b0 + m];
}

describe('hwbToRgb', () => {
  it('grayscale when w+b>=1', () => {
    const [r, g, b] = hwbToRgb(120, 0.6, 0.5);
    assert.ok(Math.abs(r - g) < 1e-9 && Math.abs(g - b) < 1e-9);
  });
});
