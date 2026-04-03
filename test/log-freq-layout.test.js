const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/visualizer.js _drawFFT log-frequency layout ──
function logFreqX(freq, width, minF, maxF) {
  const logMin = Math.log10(minF);
  const logMax = Math.log10(maxF);
  const logF = Math.log10(freq);
  return ((logF - logMin) / (logMax - logMin)) * width;
}

function binIndexForFreq(freq, sampleRate, fftSize) {
  const binFreq = sampleRate / fftSize;
  return Math.round(freq / binFreq);
}

describe('logFreqX', () => {
  it('maps min to 0', () => {
    assert.strictEqual(logFreqX(20, 1000, 20, 20000), 0);
  });

  it('maps max to width', () => {
    assert.strictEqual(logFreqX(20000, 1000, 20, 20000), 1000);
  });

  it('mid band near center in log space', () => {
    const x = logFreqX(1000, 1000, 20, 20000);
    assert.ok(x > 400 && x < 600);
  });
});

describe('binIndexForFreq', () => {
  it('DC is 0', () => {
    assert.strictEqual(binIndexForFreq(0, 44100, 2048), 0);
  });

  it('nyquist maps to last bin', () => {
    const nyq = 44100 / 2;
    const idx = binIndexForFreq(nyq, 44100, 2048);
    assert.strictEqual(idx, 1024);
  });
});
