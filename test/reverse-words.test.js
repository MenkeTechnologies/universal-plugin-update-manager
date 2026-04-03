const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function reverseWords(s) {
  return s.trim().split(/\s+/).reverse().join(' ');
}

describe('reverseWords', () => {
  it('sentence', () => assert.strictEqual(reverseWords('the sky is blue'), 'blue is sky the'));
});
