const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function det3(m) {
  const a = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]);
  const b = m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]);
  const c = m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  return a - b + c;
}

describe('det3', () => {
  it('identity', () => assert.strictEqual(det3([[1, 0, 0], [0, 1, 0], [0, 0, 1]]), 1));
});
