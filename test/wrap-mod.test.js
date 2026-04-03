const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function wrapIndex(i, len) {
  if (len <= 0) return 0;
  return ((i % len) + len) % len;
}

describe('wrapIndex', () => {
  it('positive', () => assert.strictEqual(wrapIndex(7, 5), 2));
  it('negative', () => assert.strictEqual(wrapIndex(-1, 5), 4));
  it('zero len', () => assert.strictEqual(wrapIndex(3, 0), 0));
});
