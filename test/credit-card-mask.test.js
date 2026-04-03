const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function maskPan(pan, visible = 4) {
  const d = pan.replace(/\D/g, '');
  if (d.length <= visible) return '*'.repeat(d.length);
  return '*'.repeat(d.length - visible) + d.slice(-visible);
}

describe('maskPan', () => {
  it('masks', () => assert.strictEqual(maskPan('4111111111111111'), '************1111'));
});
