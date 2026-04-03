const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function channelLuminance(c) {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(rgb) {
  const { r, g, b } = rgb;
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

function contrastRatio(a, b) {
  const L1 = relativeLuminance(a);
  const L2 = relativeLuminance(b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('contrastRatio', () => {
  it('black on white', () => {
    const c = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 1, g: 1, b: 1 });
    assert.ok(c > 20 && c < 22);
  });
});
