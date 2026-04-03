const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('bulk |a + b| <= |a| + |b|', () => {
  it('a,b in [-85,85]', () => {
    for (let a = -85; a <= 85; a++) {
      for (let b = -85; b <= 85; b++) {
        assert.ok(Math.abs(a + b) <= Math.abs(a) + Math.abs(b));
      }
    }
  });
});
