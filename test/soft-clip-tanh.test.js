const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function softClip(x, drive = 2) {
  return Math.tanh(x * drive);
}

describe('softClip', () => {
  it('bounded', () => {
    assert.ok(Math.abs(softClip(100)) < 1.0001);
  });

  it('near linear for small', () => {
    assert.ok(Math.abs(softClip(0.01) - Math.tanh(0.02)) < 1e-9);
  });
});
