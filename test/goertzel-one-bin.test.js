const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function goertzelMag(x, k, N) {
  const omega = (2 * Math.PI * k) / N;
  const coeff = 2 * Math.cos(omega);
  let s0 = 0;
  let s1 = 0;
  let s2 = 0;
  for (let i = 0; i < N; i++) {
    s0 = x[i] + coeff * s1 - s2;
    s2 = s1;
    s1 = s0;
  }
  const real = s1 - s2 * Math.cos(omega);
  const imag = s2 * Math.sin(omega);
  return Math.hypot(real, imag);
}

describe('goertzelMag', () => {
  it('detects sine bin', () => {
    const N = 64;
    const k = 4;
    const x = new Array(N);
    for (let n = 0; n < N; n++) x[n] = Math.sin((2 * Math.PI * k * n) / N);
    const m4 = goertzelMag(x, k, N);
    const m0 = goertzelMag(x, 0, N);
    assert.ok(m4 > m0 * 10);
  });
});
