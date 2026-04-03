const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function zeroCrossingRate(samples) {
  if (samples.length < 2) return 0;
  let z = 0;
  for (let i = 1; i < samples.length; i++) {
    if (samples[i - 1] * samples[i] < 0) z++;
  }
  return z / (samples.length - 1);
}

describe('zeroCrossingRate', () => {
  it('alternating', () => {
    const s = [1, -1, 1, -1];
    assert.ok(zeroCrossingRate(s) > 0.9);
  });
});
