const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function wrapPi(a) {
  let x = a;
  while (x > Math.PI) x -= 2 * Math.PI;
  while (x < -Math.PI) x += 2 * Math.PI;
  return x;
}

describe('wrapPi', () => {
  it('overflow', () => assert.ok(Math.abs(wrapPi(4) - (4 - 2 * Math.PI)) < 1e-9));
});
