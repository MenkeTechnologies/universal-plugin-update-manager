const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function transpose(m) {
  const r = m.length;
  const c = m[0].length;
  const out = [];
  for (let j = 0; j < c; j++) {
    out[j] = [];
    for (let i = 0; i < r; i++) out[j][i] = m[i][j];
  }
  return out;
}

describe('transpose', () => {
  it('2x3', () => {
    assert.deepStrictEqual(
      transpose([
        [1, 2, 3],
        [4, 5, 6],
      ]),
      [
        [1, 4],
        [2, 5],
        [3, 6],
      ]
    );
  });
});
