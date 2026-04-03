const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

describe('pointInPolygon', () => {
  it('center', () => {
    const sq = [
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ];
    assert.strictEqual(pointInPolygon(1, 1, sq), true);
    assert.strictEqual(pointInPolygon(3, 3, sq), false);
  });
});
