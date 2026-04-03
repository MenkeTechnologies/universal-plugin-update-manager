const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/visualizer.js spectrogram color lerp pattern ──
function spectroColor(t) {
  const r = Math.floor(5 + t * 206);
  const g = Math.floor(217 - t * 167);
  const b = Math.floor(232 - t * 35);
  return { r, g, b };
}

describe('spectroColor', () => {
  it('t=0 quiet', () => {
    const c = spectroColor(0);
    assert.strictEqual(c.r, 5);
    assert.strictEqual(c.g, 217);
    assert.strictEqual(c.b, 232);
  });

  it('t=1 loud', () => {
    const c = spectroColor(1);
    assert.strictEqual(c.r, 211);
    assert.strictEqual(c.g, 50);
    assert.strictEqual(c.b, 197);
  });

  it('t in 0..1', () => {
    const c = spectroColor(0.5);
    assert.ok(c.r >= 5 && c.r <= 211);
    assert.ok(c.g >= 50 && c.g <= 217);
  });
});
