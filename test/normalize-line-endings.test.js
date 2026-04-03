const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function normalizeLf(s) {
  return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

describe('normalizeLf', () => {
  it('crlf', () => assert.strictEqual(normalizeLf('a\r\nb'), 'a\nb'));
});
