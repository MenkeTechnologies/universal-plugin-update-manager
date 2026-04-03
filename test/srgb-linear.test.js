const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

describe('sRGB', () => {
  it('roundtrip mid', () => {
    const x = 0.5;
    assert.ok(Math.abs(linearToSrgb(srgbToLinear(x)) - x) < 0.002);
  });
});
