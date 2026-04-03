const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function encodeMS(L, R) {
  return { M: (L + R) * 0.5, S: (L - R) * 0.5 };
}

function decodeMS(M, S) {
  return { L: M + S, R: M - S };
}

describe('encodeMS / decodeMS', () => {
  it('roundtrip', () => {
    const { M, S } = encodeMS(0.5, -0.3);
    const { L, R } = decodeMS(M, S);
    assert.ok(Math.abs(L - 0.5) < 1e-9);
    assert.ok(Math.abs(R - -0.3) < 1e-9);
  });
});
