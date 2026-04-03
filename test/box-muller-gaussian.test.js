const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function gaussianPair(rand) {
  const u1 = rand();
  const u2 = rand();
  const r = Math.sqrt(-2 * Math.log(u1));
  return [r * Math.cos(2 * Math.PI * u2), r * Math.sin(2 * Math.PI * u2)];
}

describe('gaussianPair', () => {
  it('deterministic PRNG', () => {
    let s = 123456789;
    const rand = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    const [a, b] = gaussianPair(rand);
    assert.ok(Number.isFinite(a) && Number.isFinite(b));
  });
});
