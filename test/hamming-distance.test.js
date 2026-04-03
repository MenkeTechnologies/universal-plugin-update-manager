const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function hamming(a, b) {
  if (a.length !== b.length) return -1;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

describe('hamming', () => {
  it('equal', () => assert.strictEqual(hamming('abc', 'abc'), 0));
  it('diff', () => assert.strictEqual(hamming('karolin', 'kathrin'), 3));
  it('length mismatch', () => assert.strictEqual(hamming('a', 'ab'), -1));
});
