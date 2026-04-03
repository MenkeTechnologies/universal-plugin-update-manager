const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function isSilent(buf, eps = 1e-10) {
  for (let i = 0; i < buf.length; i++) if (Math.abs(buf[i]) > eps) return false;
  return true;
}

describe('isSilent', () => {
  it('zeros', () => assert.strictEqual(isSilent(new Float32Array(100)), true));
  it('click', () => assert.strictEqual(isSilent(new Float32Array([0, 0, 1])), false));
});
