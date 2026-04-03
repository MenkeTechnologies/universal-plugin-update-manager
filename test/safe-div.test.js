const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function safeDiv(a, b, fallback = 0) {
  if (b === 0 || !Number.isFinite(a) || !Number.isFinite(b)) return fallback;
  return a / b;
}

describe('safeDiv', () => {
  it('normal', () => assert.strictEqual(safeDiv(10, 2), 5));
  it('zero denom', () => assert.strictEqual(safeDiv(1, 0, -1), -1));
});
