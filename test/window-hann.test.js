const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function hann(n, i) {
  return 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1 || 1)));
}

describe('hann', () => {
  it('edges', () => {
    assert.ok(Math.abs(hann(5, 0)) < 1e-9);
    assert.ok(Math.abs(hann(5, 4)) < 1e-9);
  });

  it('center', () => assert.ok(hann(5, 2) > 0.9));
});
