const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function sortStr(s) {
  return [...s].sort().join('');
}

function isAnagram(a, b) {
  return sortStr(a.toLowerCase()) === sortStr(b.toLowerCase());
}

describe('isAnagram', () => {
  it('yes', () => assert.strictEqual(isAnagram('listen', 'silent'), true));
  it('no', () => assert.strictEqual(isAnagram('abc', 'ab'), false));
});
