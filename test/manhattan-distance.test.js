const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function manhattan(a, b) {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += Math.abs(a[i] - b[i]);
  return s;
}

describe('manhattan', () => {
  it('2d', () => assert.strictEqual(manhattan([1, 2], [4, 6]), 7));
});
