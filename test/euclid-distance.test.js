const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function dist2(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function dist3(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

describe('dist2', () => {
  it('unit', () => assert.ok(Math.abs(dist2([0, 0], [1, 0]) - 1) < 1e-9));
});

describe('dist3', () => {
  it('diag', () => assert.ok(Math.abs(dist3([0, 0, 0], [1, 1, 1]) - Math.sqrt(3)) < 1e-9));
});
