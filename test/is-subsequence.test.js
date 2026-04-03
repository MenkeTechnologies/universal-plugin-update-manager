const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function isSubsequence(needle, haystack) {
  let j = 0;
  for (let i = 0; i < haystack.length && j < needle.length; i++) {
    if (haystack[i] === needle[j]) j++;
  }
  return j === needle.length;
}

describe('isSubsequence', () => {
  it('yes', () => assert.strictEqual(isSubsequence('abc', 'ahbgdc'), true));
  it('no', () => assert.strictEqual(isSubsequence('axc', 'ahbgdc'), false));
});
