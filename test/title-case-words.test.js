const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function titleCase(s) {
  return s.replace(/\w+/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

describe('titleCase', () => {
  it('words', () => assert.strictEqual(titleCase('hello WORLD'), 'Hello World'));
});
