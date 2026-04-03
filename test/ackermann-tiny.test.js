const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function ack(m, n) {
  if (m === 0) return n + 1;
  if (n === 0) return ack(m - 1, 1);
  return ack(m - 1, ack(m, n - 1));
}

describe('ack', () => {
  it('small', () => assert.strictEqual(ack(2, 2), 7));
});
