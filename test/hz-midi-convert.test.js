const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const A4 = 440;

function midiToHz(m) {
  return A4 * 2 ** ((m - 69) / 12);
}

function hzToMidi(hz) {
  return 69 + 12 * Math.log2(hz / A4);
}

describe('midiToHz', () => {
  it('A4', () => assert.ok(Math.abs(midiToHz(69) - 440) < 0.01));
  it('C4', () => assert.ok(Math.abs(midiToHz(60) - 261.63) < 0.02));
});

describe('hzToMidi', () => {
  it('roundtrip', () => {
    const m = hzToMidi(440);
    assert.ok(Math.abs(m - 69) < 0.001);
  });
});
