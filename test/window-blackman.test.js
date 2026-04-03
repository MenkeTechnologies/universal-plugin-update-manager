const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function blackman(i, n) {
  const a0 = 0.42;
  const a1 = 0.5;
  const a2 = 0.08;
  const z = (2 * Math.PI * i) / (n - 1);
  return a0 - a1 * Math.cos(z) + a2 * Math.cos(2 * z);
}

describe('blackman', () => {
  it('ends near zero', () => assert.ok(Math.abs(blackman(0, 64)) < 0.01));
});
