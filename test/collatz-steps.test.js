const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function collatzSteps(n) {
  let s = 0;
  let x = n;
  while (x !== 1) {
    x = x % 2 === 0 ? x / 2 : 3 * x + 1;
    s++;
    if (s > 10000) break;
  }
  return s;
}

describe('collatzSteps', () => {
  it('1', () => assert.strictEqual(collatzSteps(1), 0));
  it('small', () => assert.strictEqual(collatzSteps(8), 3));
});
