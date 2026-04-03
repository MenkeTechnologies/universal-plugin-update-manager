const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function midpointCircle(r) {
  const pts = [];
  let x = r;
  let y = 0;
  let err = 0;
  while (x >= y) {
    pts.push([x, y]);
    y += 1;
    err += 2 * y + 1;
    if (2 * err > 2 * x - 1) {
      x -= 1;
      err -= 2 * x + 1;
    }
  }
  return pts.length;
}

describe('midpointCircle', () => {
  it('octant points', () => assert.ok(midpointCircle(5) >= 3));
});
