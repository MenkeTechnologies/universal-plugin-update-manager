const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function aabbHit(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

describe('aabbHit', () => {
  it('overlap', () => assert.strictEqual(aabbHit(0, 0, 2, 2, 1, 1, 2, 2), true));
  it('separate', () => assert.strictEqual(aabbHit(0, 0, 1, 1, 5, 5, 1, 1), false));
});
