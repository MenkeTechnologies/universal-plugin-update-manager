const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function dot(a, b) {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

describe('dot', () => {
  it('orthogonal', () => assert.strictEqual(dot([1, 0], [0, 1]), 0));
  it('parallel', () => assert.strictEqual(dot([2, 3], [4, 5]), 23));
});
