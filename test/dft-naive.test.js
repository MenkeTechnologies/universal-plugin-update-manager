const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function dft(re, im) {
  const n = re.length;
  const outRe = new Array(n);
  const outIm = new Array(n);
  for (let k = 0; k < n; k++) {
    let sr = 0;
    let si = 0;
    for (let j = 0; j < n; j++) {
      const ang = (-2 * Math.PI * k * j) / n;
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      sr += re[j] * c - im[j] * s;
      si += re[j] * s + im[j] * c;
    }
    outRe[k] = sr;
    outIm[k] = si;
  }
  return { re: outRe, im: outIm };
}

describe('dft', () => {
  it('impulse', () => {
    const { re, im } = dft([1, 0, 0, 0], [0, 0, 0, 0]);
    for (let k = 0; k < 4; k++) assert.ok(Math.abs(re[k] - 1) < 1e-9 && Math.abs(im[k]) < 1e-9);
  });
});
