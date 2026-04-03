const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function product(arr) {
  return arr.reduce((a, b) => a * b, 1);
}

describe('product', () => {
  it('empty is 1', () => assert.strictEqual(product([]), 1));
  it('values', () => assert.strictEqual(product([2, 3, 4]), 24));
});
