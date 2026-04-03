const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function truncate(s, max, ellipsis = '…') {
  if (s.length <= max) return s;
  return s.slice(0, max - ellipsis.length) + ellipsis;
}

describe('truncate', () => {
  it('short unchanged', () => assert.strictEqual(truncate('hi', 10), 'hi'));
  it('long', () => assert.strictEqual(truncate('abcdefghij', 5), 'abcd…'));
});
