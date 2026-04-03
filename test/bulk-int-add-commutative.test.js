const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('bulk a + b === b + a', () => {
  it('a,b in [-100,100]', () => {
    for (let a = -100; a <= 100; a++) {
      for (let b = -100; b <= 100; b++) {
        assert.strictEqual(a + b, b + a);
      }
    }
  });
});
