const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function safeParseUrl(s) {
  try {
    return new URL(s);
  } catch {
    return null;
  }
}

describe('safeParseUrl', () => {
  it('valid', () => {
    const u = safeParseUrl('https://example.com/a?b=1');
    assert.strictEqual(u.hostname, 'example.com');
  });

  it('invalid', () => assert.strictEqual(safeParseUrl('not a url'), null));
});
