const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function pcm16ToFloat(s) {
  return s / 32768;
}

function floatToPcm16(x) {
  const c = Math.max(-1, Math.min(1, x));
  return (c < 0 ? c * 0x8000 : c * 0x7fff) | 0;
}

describe('pcm16ToFloat', () => {
  it('max', () => assert.ok(Math.abs(pcm16ToFloat(32767) - 32767 / 32768) < 1e-6));
});

describe('floatToPcm16', () => {
  it('roundtrip', () => {
    const s = floatToPcm16(0.5);
    assert.ok(Math.abs(pcm16ToFloat(s) - 0.5) < 0.001);
  });
});
