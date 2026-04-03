const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/file-browser.js fileIcon ──
const AUDIO_EXTS = ['wav', 'mp3', 'aiff', 'aif', 'flac', 'ogg', 'm4a', 'aac', 'opus', 'wma'];
const DAW_EXTS = ['als', 'logicx', 'flp', 'rpp', 'cpr', 'npr', 'ptx', 'ptf', 'song', 'reason', 'aup', 'aup3', 'band', 'ardour', 'dawproject', 'bwproject'];
const PLUGIN_EXTS = ['vst', 'vst3', 'component', 'aaxplugin'];

function fileIcon(entry) {
  if (entry.isDir) return '&#128193;';
  const ext = entry.ext;
  if (AUDIO_EXTS.includes(ext)) return '&#127925;';
  if (DAW_EXTS.includes(ext)) return '&#127911;';
  if (PLUGIN_EXTS.includes(ext)) return '&#9889;';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return '&#128247;';
  if (['pdf'].includes(ext)) return '&#128196;';
  if (['json', 'toml', 'xml', 'yaml', 'yml'].includes(ext)) return '&#128203;';
  if (['zip', 'gz', 'tar', 'rar', '7z', 'dmg'].includes(ext)) return '&#128230;';
  return '&#128196;';
}

describe('fileIcon', () => {
  it('directory', () => {
    assert.strictEqual(fileIcon({ isDir: true, ext: 'wav' }), '&#128193;');
  });

  it('audio', () => {
    assert.strictEqual(fileIcon({ isDir: false, ext: 'flac' }), '&#127925;');
    assert.strictEqual(fileIcon({ isDir: false, ext: 'opus' }), '&#127925;');
  });

  it('daw projects', () => {
    assert.strictEqual(fileIcon({ isDir: false, ext: 'als' }), '&#127911;');
    assert.strictEqual(fileIcon({ isDir: false, ext: 'logicx' }), '&#127911;');
    assert.strictEqual(fileIcon({ isDir: false, ext: 'dawproject' }), '&#127911;');
    assert.strictEqual(fileIcon({ isDir: false, ext: 'ardour' }), '&#127911;');
  });

  it('plugins', () => {
    assert.strictEqual(fileIcon({ isDir: false, ext: 'vst3' }), '&#9889;');
    assert.strictEqual(fileIcon({ isDir: false, ext: 'aaxplugin' }), '&#9889;');
  });

  it('images and archives', () => {
    assert.strictEqual(fileIcon({ isDir: false, ext: 'png' }), '&#128247;');
    assert.strictEqual(fileIcon({ isDir: false, ext: 'zip' }), '&#128230;');
  });

  it('config', () => {
    assert.strictEqual(fileIcon({ isDir: false, ext: 'json' }), '&#128203;');
  });

  it('generic document fallback', () => {
    assert.strictEqual(fileIcon({ isDir: false, ext: 'txt' }), '&#128196;');
    assert.strictEqual(fileIcon({ isDir: false, ext: 'pdf' }), '&#128196;');
  });
});
