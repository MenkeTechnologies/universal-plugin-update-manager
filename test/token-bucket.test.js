const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function tokensAfterRefill(capacity, refillPerSec, elapsedSec, prevTokens) {
  return Math.min(capacity, prevTokens + refillPerSec * elapsedSec);
}

describe('tokenBucket', () => {
  it('caps', () => assert.strictEqual(tokensAfterRefill(10, 5, 10, 0), 10));
  it('partial', () => assert.strictEqual(tokensAfterRefill(100, 2, 3, 5), 11));
});
