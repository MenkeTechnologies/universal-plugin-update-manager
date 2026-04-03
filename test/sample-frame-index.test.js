const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function frameIndexAtTime(seconds, sampleRate) {
  return Math.floor(seconds * sampleRate);
}

function timeAtFrame(frame, sampleRate) {
  return frame / sampleRate;
}

describe('frameIndexAtTime', () => {
  it('1s at 48k', () => assert.strictEqual(frameIndexAtTime(1, 48000), 48000));
});

describe('timeAtFrame', () => {
  it('inverse', () => assert.strictEqual(timeAtFrame(48000, 48000), 1));
});
