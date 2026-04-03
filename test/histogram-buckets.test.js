const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function histogram(values, bucketCount, minV, maxV) {
  const buckets = new Array(bucketCount).fill(0);
  if (maxV <= minV) return buckets;
  const span = maxV - minV;
  for (const v of values) {
    let i = Math.floor(((v - minV) / span) * bucketCount);
    if (i < 0) i = 0;
    if (i >= bucketCount) i = bucketCount - 1;
    buckets[i]++;
  }
  return buckets;
}

describe('histogram', () => {
  it('uniform spread', () => {
    const h = histogram([0, 1, 2, 3, 4], 5, 0, 4);
    assert.deepStrictEqual(h, [1, 1, 1, 1, 1]);
  });

  it('clamps high', () => {
    const h = histogram([0, 10], 2, 0, 10);
    assert.strictEqual(h[1], 1);
  });
});
