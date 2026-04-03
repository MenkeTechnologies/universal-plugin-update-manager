const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function smootherstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

describe('smoothstep', () => {
  it('ends', () => {
    assert.strictEqual(smoothstep(0, 1, 0), 0);
    assert.strictEqual(smoothstep(0, 1, 1), 1);
  });
});

describe('smootherstep', () => {
  it('ends', () => {
    assert.strictEqual(smootherstep(0, 1, 0), 0);
    assert.strictEqual(smootherstep(0, 1, 1), 1);
  });
});
