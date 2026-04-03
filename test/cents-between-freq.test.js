const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function cents(f1, f2) {
  return 1200 * Math.log2(f2 / f1);
}

describe('cents', () => {
  it('octave', () => assert.ok(Math.abs(cents(440, 880) - 1200) < 1e-9));
});
