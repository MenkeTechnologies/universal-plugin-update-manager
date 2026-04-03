const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function radixSortUint32(arr) {
  const a = arr.slice();
  const n = a.length;
  const buf = new Uint32Array(n);
  for (let shift = 0; shift < 32; shift += 8) {
    const count = new Uint32Array(256);
    for (let i = 0; i < n; i++) count[(a[i] >>> shift) & 0xff]++;
    for (let i = 1; i < 256; i++) count[i] += count[i - 1];
    for (let i = n - 1; i >= 0; i--) buf[--count[(a[i] >>> shift) & 0xff]] = a[i];
    for (let i = 0; i < n; i++) a[i] = buf[i];
  }
  return a;
}

describe('radixSortUint32', () => {
  it('sorts', () => {
    const x = new Uint32Array([3, 1, 4, 1, 5, 9, 2, 6]);
    assert.deepStrictEqual([...radixSortUint32(x)], [...x].sort((a, b) => a - b));
  });
});
