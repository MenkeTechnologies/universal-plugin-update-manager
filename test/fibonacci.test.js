const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function fib(n) {
  if (n <= 1) return n;
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}

describe('fib', () => {
  it('sequence', () => {
    assert.strictEqual(fib(0), 0);
    assert.strictEqual(fib(1), 1);
    assert.strictEqual(fib(10), 55);
  });
});
