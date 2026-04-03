const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// De-interleave stereo PCM [L,R,L,R,...] → [L...], [R...]
function deinterleaveStereo(interleaved) {
  const n = interleaved.length / 2;
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    L[i] = interleaved[i * 2];
    R[i] = interleaved[i * 2 + 1];
  }
  return { L, R };
}

describe('deinterleaveStereo', () => {
  it('splits', () => {
    const { L, R } = deinterleaveStereo(new Float32Array([1, 2, 3, 4]));
    assert.deepStrictEqual([...L], [1, 3]);
    assert.deepStrictEqual([...R], [2, 4]);
  });

  it('empty', () => {
    const { L, R } = deinterleaveStereo(new Float32Array([]));
    assert.strictEqual(L.length, 0);
    assert.strictEqual(R.length, 0);
  });
});
