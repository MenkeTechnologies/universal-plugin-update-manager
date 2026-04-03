const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('bulk a * b === b * a', () => {
  it('a,b in [-90,90]', () => {
    for (let a = -90; a <= 90; a++) {
      for (let b = -90; b <= 90; b++) {
        assert.strictEqual(a * b, b * a);
      }
    }
  });
});
