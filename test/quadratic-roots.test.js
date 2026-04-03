const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function quadraticRoots(a, b, c) {
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  if (disc === 0) return [-b / (2 * a)];
  const s = Math.sqrt(disc);
  return [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((x, y) => x - y);
}

describe('quadraticRoots', () => {
  it('x^2-1', () => {
    const r = quadraticRoots(1, 0, -1);
    assert.ok(Math.abs(r[0] + 1) < 1e-9 && Math.abs(r[1] - 1) < 1e-9);
  });
});
