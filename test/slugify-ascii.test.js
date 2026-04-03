const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

describe('slugify', () => {
  it('spaces', () => assert.strictEqual(slugify('  Hello World!  '), 'hello-world'));
});
