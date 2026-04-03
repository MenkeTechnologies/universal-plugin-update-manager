const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const READ = 1;
const WRITE = 2;
const EXEC = 4;

function has(flags, bit) {
  return (flags & bit) === bit;
}

describe('bit flags', () => {
  it('combine', () => {
    const f = READ | WRITE;
    assert.strictEqual(has(f, READ), true);
    assert.strictEqual(has(f, EXEC), false);
  });
});
