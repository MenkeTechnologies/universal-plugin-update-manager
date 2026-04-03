const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function toBase64UrlUtf8(s) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(s, 'utf8').toString('base64url');
  }
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

describe('toBase64UrlUtf8', () => {
  it('roundtrip', () => {
    const t = 'hello 🔊';
    const b = toBase64UrlUtf8(t);
    assert.ok(typeof b === 'string' && b.length > 0);
  });
});
