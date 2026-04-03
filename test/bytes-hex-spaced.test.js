const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function bytesToHexSpaced(u8) {
  return Array.from(u8, b => b.toString(16).padStart(2, '0')).join(' ');
}

describe('bytesToHexSpaced', () => {
  it('abc', () =>
    assert.strictEqual(bytesToHexSpaced(new Uint8Array([0xab, 0xcd])), 'ab cd'));
});
