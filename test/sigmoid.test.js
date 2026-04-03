const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

describe('sigmoid', () => {
  it('0 is half', () => assert.ok(Math.abs(sigmoid(0) - 0.5) < 1e-9));
  it('bounded', () => {
    assert.ok(sigmoid(10) > 0.99);
    assert.ok(sigmoid(-10) < 0.01);
  });
});
