const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function qmul(a, b) {
  const [aw, ax, ay, az] = a;
  const [bw, bx, by, bz] = b;
  return [
    aw * bw - ax * bx - ay * by - az * bz,
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
  ];
}

describe('qmul', () => {
  it('identity', () => {
    const id = [1, 0, 0, 0];
    const q = [0.70710678, 0.70710678, 0, 0];
    const r = qmul(id, q);
    assert.ok(r.every((v, i) => Math.abs(v - q[i]) < 1e-5));
  });
});
