const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function spiralOrder(n, m) {
  const out = [];
  let top = 0;
  let bottom = n - 1;
  let left = 0;
  let right = m - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push([top, c]);
    top++;
    for (let r = top; r <= bottom; r++) out.push([r, right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push([bottom, c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push([r, left]);
      left++;
    }
  }
  return out;
}

describe('spiralOrder', () => {
  it('2x2', () => {
    assert.deepStrictEqual(spiralOrder(2, 2), [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
    ]);
  });
});
