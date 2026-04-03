const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function reverseBits16(x) {
  x = ((x & 0xaaaa) >> 1) | ((x & 0x5555) << 1);
  x = ((x & 0xcccc) >> 2) | ((x & 0x3333) << 2);
  x = ((x & 0xf0f0) >> 4) | ((x & 0x0f0f) << 4);
  x = ((x & 0xff00) >> 8) | ((x & 0x00ff) << 8);
  return x & 0xffff;
}

describe('reverseBits16', () => {
  it('palindrome byte', () => assert.strictEqual(reverseBits16(0xff00), 0x00ff));
});
