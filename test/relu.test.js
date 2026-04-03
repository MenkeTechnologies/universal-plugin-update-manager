const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function relu(x) {
  return Math.max(0, x);
}

describe('relu', () => {
  it('negative', () => assert.strictEqual(relu(-3), 0));
  it('positive', () => assert.strictEqual(relu(5), 5));
});
