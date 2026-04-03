const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// De-interleave stereo PCM [L,R,L,R,...] → [L...], [R...]
function deinterleaveStereo(interleaved) {
  const pairs = interleaved.length >> 1;
  const hasLoneL = interleaved.length % 2 === 1;
  const L = new Float32Array(pairs + (hasLoneL ? 1 : 0));
  const R = new Float32Array(pairs);
  for (let i = 0; i < pairs; i++) {
    L[i] = interleaved[i * 2];
    R[i] = interleaved[i * 2 + 1];
  }
  if (hasLoneL) {
    L[pairs] = interleaved[interleaved.length - 1];
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

  it('single ch1 sample', () => {
    const { L, R } = deinterleaveStereo(new Float32Array([1]));
    assert.strictEqual(L.length, 1);
    assert.strictEqual(R.length, 0);
  });

  it('single ch2 sample', () => {
    const { L, R } = deinterleaveStereo(new Float32Array([1, 2]));
    assert.deepStrictEqual([...L], [1]);
    assert.deepStrictEqual([...R], [2]);
  });

  it('larger stereo', () => {
    const inter = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]);
    const { L, R } = deinterleaveStereo(inter);
    assert.strictEqual(L.length, 3);
    assert.strictEqual(R.length, 3);
    assert.deepStrictEqual(L, new Float32Array([inter[0], inter[2], inter[4]]));
    assert.deepStrictEqual(R, new Float32Array([inter[1], inter[3], inter[5]]));
  });
});
