const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function toKebab(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

describe('toKebab', () => {
  it('camel', () => assert.strictEqual(toKebab('fooBarBaz'), 'foo-bar-baz'));
  it('spaces', () => assert.strictEqual(toKebab('Hello World'), 'hello-world'));
});
