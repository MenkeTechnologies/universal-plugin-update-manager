const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function lerp(a, b, t) {
  return a + (b - a) * t;
}

describe('lerp', () => {
  it('mid', () => assert.strictEqual(lerp(0, 10, 0.5), 5));
});
