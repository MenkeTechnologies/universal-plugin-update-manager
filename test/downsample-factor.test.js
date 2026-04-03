const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function downsampleStride(fromSr, toSr) {
  if (toSr <= 0 || fromSr <= 0) return 1;
  const g = gcd(fromSr, toSr);
  return fromSr / g;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

describe('downsampleStride', () => {
  it('48k to 44.1k ratio', () => {
    assert.strictEqual(downsampleStride(48000, 44100), 160);
  });
});
