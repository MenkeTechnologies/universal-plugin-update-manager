const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function durationSec(numSamples, sampleRate) {
  return numSamples / sampleRate;
}

function samplesForMs(ms, sampleRate) {
  return Math.round((ms / 1000) * sampleRate);
}

describe('durationSec', () => {
  it('48k one sec', () => assert.strictEqual(durationSec(48000, 48000), 1));
});

describe('samplesForMs', () => {
  it('100ms at 48k', () => assert.strictEqual(samplesForMs(100, 48000), 4800));
});
