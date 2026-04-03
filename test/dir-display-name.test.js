const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/file-browser.js addFavDir name ──
function displayDirName(dirPath) {
  const name = dirPath.split('/').filter(Boolean).pop() || dirPath;
  return name;
}

describe('displayDirName', () => {
  it('last segment', () => {
    assert.strictEqual(displayDirName('/Users/foo/Plugins'), 'Plugins');
  });

  it('trailing slash', () => {
    assert.strictEqual(displayDirName('/a/b/c/'), 'c');
  });

  it('single segment', () => {
    assert.strictEqual(displayDirName('relative'), 'relative');
  });

  it('root-like', () => {
    assert.strictEqual(displayDirName('/'), '/');
  });
});
