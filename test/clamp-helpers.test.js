const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

function clamp01(x) {
  return clamp(x, 0, 1);
}

describe('clamp', () => {
  it('in range', () => assert.strictEqual(clamp(5, 0, 10), 5));
  it('below', () => assert.strictEqual(clamp(-1, 0, 10), 0));
  it('above', () => assert.strictEqual(clamp(99, 0, 10), 10));
});

describe('clamp01', () => {
  it('fraction', () => assert.strictEqual(clamp01(0.5), 0.5));
  it('high', () => assert.strictEqual(clamp01(2), 1));
  it('low', () => assert.strictEqual(clamp01(-0.1), 0));
});
