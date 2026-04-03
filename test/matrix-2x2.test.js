const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function det2(m) {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

function mul2(a, b) {
  return [
    [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
    [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
  ];
}

describe('det2', () => {
  it('identity', () => assert.strictEqual(det2([[1, 0], [0, 1]]), 1));
});

describe('mul2', () => {
  it('identity', () => {
    const I = [
      [1, 0],
      [0, 1],
    ];
    assert.deepStrictEqual(mul2(I, I), I);
  });
});
