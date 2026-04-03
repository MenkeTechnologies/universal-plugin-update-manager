const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/utils.js escapePath (SQL-like string escaping for paths) ──
function escapePath(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

describe('escapePath', () => {
  it('escapes backslashes', () => {
    assert.strictEqual(escapePath('C:\\foo\\bar'), 'C:\\\\foo\\\\bar');
  });

  it('escapes single quotes', () => {
    assert.strictEqual(escapePath("foo'bar"), "foo\\'bar");
  });

  it('combined', () => {
    assert.strictEqual(escapePath("C:\\Users\\O'Brien"), "C:\\\\Users\\\\O\\'Brien");
  });

  it('empty and plain', () => {
    assert.strictEqual(escapePath(''), '');
    assert.strictEqual(escapePath('/unix/path'), '/unix/path');
  });
});
