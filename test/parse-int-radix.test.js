const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('parseInt radix', () => {
  it('hex', () => assert.strictEqual(parseInt('ff', 16), 255));
  it('binary', () => assert.strictEqual(parseInt('1010', 2), 10));
});
