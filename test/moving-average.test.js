const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function movingAverage(values, window) {
  if (window <= 0 || values.length === 0) return [];
  const out = [];
  let sum = 0;
  const q = [];
  for (let i = 0; i < values.length; i++) {
    q.push(values[i]);
    sum += values[i];
    if (q.length > window) sum -= q.shift();
    out.push(sum / q.length);
  }
  return out;
}

describe('movingAverage', () => {
  it('window 2', () => {
    assert.deepStrictEqual(
      movingAverage([1, 3, 5, 5], 2).map(x => Math.round(x * 10) / 10),
      [1, 2, 4, 5]
    );
  });

  it('empty', () => {
    assert.deepStrictEqual(movingAverage([], 3), []);
  });
});
