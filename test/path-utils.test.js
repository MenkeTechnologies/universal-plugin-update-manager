const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Helpers used across the app ──
function logPathFromPrefs(prefsPath) {
  return prefsPath.replace(/preferences\.toml$/, 'app.log');
}

function extnameLower(path) {
  const i = path.lastIndexOf('.');
  if (i <= 0 || i === path.length - 1) return '';
  return path.slice(i + 1).toLowerCase();
}

function basenamePosix(path) {
  const parts = path.split('/').filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '';
}

describe('logPathFromPrefs', () => {
  it('replaces preferences.toml with app.log', () => {
    assert.strictEqual(
      logPathFromPrefs('/Users/x/Library/app/preferences.toml'),
      '/Users/x/Library/app/app.log'
    );
  });

  it('leaves path without suffix unchanged', () => {
    assert.strictEqual(logPathFromPrefs('/tmp/foo.toml'), '/tmp/foo.toml');
  });
});

describe('extnameLower', () => {
  it('returns lowercase extension', () => {
    assert.strictEqual(extnameLower('/a/B/c.WAV'), 'wav');
    assert.strictEqual(extnameLower('file.VST3'), 'vst3');
  });

  it('hidden file .bashrc', () => {
    assert.strictEqual(extnameLower('/home/.bashrc'), 'bashrc');
  });

  it('no extension', () => {
    assert.strictEqual(extnameLower('/usr/bin/sh'), '');
  });
});

describe('basenamePosix', () => {
  it('last segment', () => {
    assert.strictEqual(basenamePosix('/a/b/c.txt'), 'c.txt');
  });

  it('trailing slash', () => {
    assert.strictEqual(basenamePosix('/a/b/'), 'b');
  });
});
