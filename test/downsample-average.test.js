const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function downsampleAvg(samples, factor) {
  if (factor < 1) return samples.slice();
  const out = [];
  for (let i = 0; i < samples.length; i += factor) {
    let sum = 0;
    let n = 0;
    for (let j = 0; j < factor && i + j < samples.length; j++) {
      sum += samples[i + j];
      n++;
    }
    out.push(sum / n);
  }
  return out;
}

describe('downsampleAvg', () => {
  it('factor 2', () => assert.deepStrictEqual(downsampleAvg([1, 3, 2, 4], 2), [2, 3]));
});
