const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function nyquistHz(sampleRate) {
  return sampleRate / 2;
}

describe('nyquistHz', () => {
  it('44.1k', () => assert.strictEqual(nyquistHz(44100), 22050));
  it('48k', () => assert.strictEqual(nyquistHz(48000), 24000));
});
