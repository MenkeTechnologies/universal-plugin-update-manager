const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('bulk a & (b | c) === (a & b) | (a & c)', () => {
  it('a,b,c in [0,31]', () => {
    for (let a = 0; a < 32; a++) {
      for (let b = 0; b < 32; b++) {
        for (let c = 0; c < 32; c++) {
          assert.strictEqual(a & (b | c), (a & b) | (a & c));
          assert.strictEqual(a | (b & c), (a | b) & (a | c));
        }
      }
    }
  });
});
