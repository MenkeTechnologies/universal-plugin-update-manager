const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function chebyshev(a, b) {
  let m = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(a[i] - b[i]));
  return m;
}

describe('chebyshev', () => {
  it('max coord diff', () => assert.strictEqual(chebyshev([1, 10], [4, 7]), 3));
});
