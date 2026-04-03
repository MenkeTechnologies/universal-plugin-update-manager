const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function toHex(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

describe('toHex', () => {
  it('bytes', () => assert.strictEqual(toHex(new Uint8Array([0, 255, 16])), '00ff10'));
});
