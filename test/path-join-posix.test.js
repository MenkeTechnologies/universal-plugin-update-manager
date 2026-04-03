const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

describe('path.posix.join', () => {
  it('normalizes', () => {
    assert.strictEqual(path.posix.join('/a', 'b', '..', 'c'), '/a/c');
  });
});
