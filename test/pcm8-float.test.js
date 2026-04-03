const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function u8ToFloat(u) {
  return (u - 128) / 128;
}

describe('u8ToFloat', () => {
  it('mid', () => assert.strictEqual(u8ToFloat(128), 0));
});
