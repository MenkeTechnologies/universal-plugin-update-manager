const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function linearFade(t) {
  return t;
}

function equalPowerFade(t) {
  return Math.sin((t * Math.PI) / 2);
}

describe('linearFade', () => {
  it('endpoints', () => {
    assert.strictEqual(linearFade(0), 0);
    assert.strictEqual(linearFade(1), 1);
  });
});

describe('equalPowerFade', () => {
  it('endpoints', () => {
    assert.ok(Math.abs(equalPowerFade(0)) < 1e-10);
    assert.ok(Math.abs(equalPowerFade(1) - 1) < 1e-10);
  });

  it('midpoint above linear', () => {
    assert.ok(equalPowerFade(0.5) > 0.5);
  });
});
