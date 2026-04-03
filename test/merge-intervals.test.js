const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];
  const s = [...intervals].sort((a, b) => a[0] - b[0]);
  const out = [s[0].slice()];
  for (let i = 1; i < s.length; i++) {
    const cur = out[out.length - 1];
    const [a, b] = s[i];
    if (a <= cur[1]) cur[1] = Math.max(cur[1], b);
    else out.push([a, b]);
  }
  return out;
}

describe('mergeIntervals', () => {
  it('overlapping', () => {
    assert.deepStrictEqual(
      mergeIntervals([
        [1, 3],
        [2, 6],
        [8, 10],
        [15, 18],
      ]),
      [
        [1, 6],
        [8, 10],
        [15, 18],
      ]
    );
  });
});
