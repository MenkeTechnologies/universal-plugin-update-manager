const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function joinUrlPath(base, segment) {
  const b = base.replace(/\/+$/, '');
  const s = segment.replace(/^\/+/, '');
  return `${b}/${s}`;
}

describe('joinUrlPath', () => {
  it('normal', () => {
    assert.strictEqual(joinUrlPath('https://a.com', 'b'), 'https://a.com/b');
  });

  it('strips duplicate slashes', () => {
    assert.strictEqual(joinUrlPath('https://a.com/', '/b/'), 'https://a.com/b/');
  });
});
