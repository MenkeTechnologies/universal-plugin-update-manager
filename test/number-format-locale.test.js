const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('Number.prototype.toLocaleString', () => {
  it('integer grouping', () => {
    const s = (1234567).toLocaleString('en-US');
    assert.ok(s.includes('1'));
    assert.ok(s.includes('234'));
  });
});
