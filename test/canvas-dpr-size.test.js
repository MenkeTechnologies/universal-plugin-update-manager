const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/visualizer.js _resizeCanvases ──
function canvasBackingSize(cssWidth, cssHeight, devicePixelRatio) {
  const dpr = devicePixelRatio || 1;
  return {
    width: Math.floor(cssWidth * dpr),
    height: Math.floor(cssHeight * dpr),
  };
}

describe('canvasBackingSize', () => {
  it('1x dpr', () => {
    const s = canvasBackingSize(300, 200, 1);
    assert.strictEqual(s.width, 300);
    assert.strictEqual(s.height, 200);
  });

  it('2x retina', () => {
    const s = canvasBackingSize(300, 150, 2);
    assert.strictEqual(s.width, 600);
    assert.strictEqual(s.height, 300);
  });

  it('defaults dpr when missing', () => {
    const s = canvasBackingSize(100, 100, undefined);
    assert.strictEqual(s.width, 100);
  });

  it('floors fractional', () => {
    const s = canvasBackingSize(100.7, 50.2, 1.5);
    assert.strictEqual(s.width, 151);
  });
});
