const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function rms(samples) {
  if (samples.length === 0) return 0;
  let s = 0;
  for (let i = 0; i < samples.length; i++) s += samples[i] * samples[i];
  return Math.sqrt(s / samples.length);
}

function peak(samples) {
  let m = 0;
  for (let i = 0; i < samples.length; i++) m = Math.max(m, Math.abs(samples[i]));
  return m;
}

describe('rms', () => {
  it('sine-like', () => {
    const s = new Float32Array(1024).map((_, i) => Math.sin((i / 1024) * 2 * Math.PI));
    const v = rms(s);
    assert.ok(v > 0.6 && v < 0.75);
  });
});

describe('peak', () => {
  it('max abs', () => {
    const p = peak(new Float32Array([-0.3, 0.8, -0.1]));
    assert.ok(Math.abs(p - 0.8) < 1e-6);
  });
});
