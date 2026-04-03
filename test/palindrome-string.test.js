const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function isPalindrome(s) {
  const t = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return t === [...t].reverse().join('');
}

describe('isPalindrome', () => {
  it('phrase', () => assert.strictEqual(isPalindrome('A man, a plan, a canal: Panama'), true));
  it('no', () => assert.strictEqual(isPalindrome('hello'), false));
});
