const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function toSnake(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

describe('toSnake', () => {
  it('camel', () => assert.strictEqual(toSnake('fooBar'), 'foo_bar'));
});
