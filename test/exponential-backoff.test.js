const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function backoffMs(attempt, baseMs, capMs) {
  const t = baseMs * 2 ** attempt;
  return Math.min(t, capMs);
}

describe('backoffMs', () => {
  it('doubles', () => assert.strictEqual(backoffMs(0, 100, 10000), 100));
  it('caps', () => assert.strictEqual(backoffMs(10, 100, 5000), 5000));
});
