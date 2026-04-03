const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function floodCount(grid, sr, sc) {
  const h = grid.length;
  const w = grid[0].length;
  const target = grid[sr][sc];
  const seen = new Set();
  const key = (r, c) => r + ',' + c;
  const stack = [[sr, sc]];
  let n = 0;
  while (stack.length) {
    const [r, c] = stack.pop();
    const k = key(r, c);
    if (seen.has(k)) continue;
    if (r < 0 || c < 0 || r >= h || c >= w) continue;
    if (grid[r][c] !== target) continue;
    seen.add(k);
    n++;
    stack.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]);
  }
  return n;
}

describe('floodCount', () => {
  it('block', () => {
    const g = [
      [1, 1, 0],
      [1, 1, 0],
      [0, 0, 0],
    ];
    assert.strictEqual(floodCount(g, 0, 0), 4);
  });
});
