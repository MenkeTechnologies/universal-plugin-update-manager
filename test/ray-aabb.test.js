const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function rayAabb(ox, oy, dx, dy, minx, miny, maxx, maxy) {
  let tmin = -Infinity;
  let tmax = Infinity;
  for (let i = 0; i < 2; i++) {
    const o = i === 0 ? ox : oy;
    const d = i === 0 ? dx : dy;
    const mn = i === 0 ? minx : miny;
    const mx = i === 0 ? maxx : maxy;
    if (Math.abs(d) < 1e-12) {
      if (o < mn || o > mx) return null;
    } else {
      const t1 = (mn - o) / d;
      const t2 = (mx - o) / d;
      const t0 = Math.min(t1, t2);
      const t1b = Math.max(t1, t2);
      tmin = Math.max(tmin, t0);
      tmax = Math.min(tmax, t1b);
    }
  }
  if (tmax < tmin || tmax < 0) return null;
  const t = tmin >= 0 ? tmin : tmax;
  return t >= 0 ? t : null;
}

describe('rayAabb', () => {
  it('hits', () => assert.ok(rayAabb(-1, 0, 1, 0, 0, -1, 1, 1) !== null));
});
