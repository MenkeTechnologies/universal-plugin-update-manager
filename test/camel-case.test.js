const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function toCamel(s) {
  return s
    .toLowerCase()
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase());
}

describe('toCamel', () => {
  it('kebab', () => assert.strictEqual(toCamel('my-plugin-name'), 'myPluginName'));
});
