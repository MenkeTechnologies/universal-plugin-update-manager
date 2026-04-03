const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function fileName(path) {
  const parts = path.split(/[/\\]/).filter(Boolean);
  return parts.pop() || '';
}

function extension(name) {
  const i = name.lastIndexOf('.');
  if (i <= 0) return '';
  return name.slice(i + 1).toLowerCase();
}

describe('fileName', () => {
  it('unix', () => {
    assert.strictEqual(fileName('/a/b/c.wav'), 'c.wav');
  });

  it('windows', () => {
    assert.strictEqual(fileName('C:\\Plugins\\X.vst3'), 'X.vst3');
  });

  it('trailing slash', () => {
    assert.strictEqual(fileName('/a/b/'), 'b');
  });
});

describe('extension', () => {
  it('lowercases', () => {
    assert.strictEqual(extension('Foo.WAV'), 'wav');
  });

  it('hidden file no ext', () => {
    assert.strictEqual(extension('.env'), '');
  });

  it('no dot', () => {
    assert.strictEqual(extension('README'), '');
  });
});
