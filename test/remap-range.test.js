const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function remap(x, loIn, hiIn, loOut, hiOut) {
  return loOut + ((x - loIn) * (hiOut - loOut)) / (hiIn - loIn);
}

describe('remap', () => {
  it('mid', () => assert.ok(Math.abs(remap(5, 0, 10, 0, 100) - 50) < 1e-9));
});
