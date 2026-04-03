const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function toBase(n, b) {
  if (n === 0) return '0';
  const digits = '0123456789abcdefghijklmnopqrstuvwxyz';
  let s = '';
  let x = n;
  while (x > 0) {
    s = digits[x % b] + s;
    x = (x / b) | 0;
  }
  return s;
}

describe('toBase', () => {
  it('hex 255', () => assert.strictEqual(toBase(255, 16), 'ff'));
});
