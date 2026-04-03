const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 1 : inter / union;
}

describe('jaccard', () => {
  it('identical', () => assert.strictEqual(jaccard([1, 2, 3], [1, 2, 3]), 1));
  it('disjoint', () => assert.strictEqual(jaccard([1], [2]), 0));
  it('one of three', () => assert.strictEqual(jaccard([1, 2], [2, 3]), 1 / 3));
});
