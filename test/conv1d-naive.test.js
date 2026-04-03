const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function conv1d(x, h) {
  const y = new Array(x.length + h.length - 1).fill(0);
  for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < h.length; j++) y[i + j] += x[i] * h[j];
  }
  return y;
}

describe('conv1d', () => {
  it('box', () => assert.deepStrictEqual(conv1d([1, 1, 1], [0.5, 0.5]), [0.5, 1, 1, 0.5]));
});
