const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function isValidIPv4(s) {
  const p = s.split('.');
  if (p.length !== 4) return false;
  for (const x of p) {
    if (!/^\d+$/.test(x)) return false;
    const n = +x;
    if (n < 0 || n > 255 || (x.length > 1 && x[0] === '0')) return false;
  }
  return true;
}

describe('isValidIPv4', () => {
  it('ok', () => assert.strictEqual(isValidIPv4('192.168.0.1'), true));
  it('no', () => assert.strictEqual(isValidIPv4('256.1.1.1'), false));
});
