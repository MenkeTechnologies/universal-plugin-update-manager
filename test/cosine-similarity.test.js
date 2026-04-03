const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

describe('cosine', () => {
  it('same direction', () => assert.ok(Math.abs(cosine([1, 2, 3], [2, 4, 6]) - 1) < 1e-9));
  it('orthogonal', () => assert.ok(Math.abs(cosine([1, 0], [0, 1])) < 1e-9));
});
