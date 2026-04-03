const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Mirrored from frontend/js/shortcuts.js formatKey (platform injected for tests) ──

function formatKey(shortcut, platform) {
  const isMac = (platform || '').includes('Mac');
  const parts = [];
  if (shortcut.mod) parts.push(isMac ? '\u2318' : 'Ctrl');
  let k = shortcut.key;
  if (k === ' ') k = 'Space';
  else if (k === 'ArrowLeft') k = '\u2190';
  else if (k === 'ArrowRight') k = '\u2192';
  else if (k === 'ArrowUp') k = '\u2191';
  else if (k === 'ArrowDown') k = '\u2193';
  else if (k === 'Escape') k = 'Esc';
  else k = k.toUpperCase();
  parts.push(k);
  return parts.join('+');
}

describe('formatKey', () => {
  it('shows Command symbol on Mac when mod is true', () => {
    assert.strictEqual(
      formatKey({ key: 'k', mod: true }, 'MacIntel'),
      '\u2318+K'
    );
  });

  it('shows Ctrl on Windows when mod is true', () => {
    assert.strictEqual(
      formatKey({ key: 'k', mod: true }, 'Win32'),
      'Ctrl+K'
    );
  });

  it('renders Space for space key', () => {
    assert.strictEqual(
      formatKey({ key: ' ', mod: false }, 'MacIntel'),
      'Space'
    );
  });

  it('renders arrow glyphs', () => {
    assert.strictEqual(formatKey({ key: 'ArrowLeft', mod: true }, 'MacIntel'), '\u2318+\u2190');
    assert.strictEqual(formatKey({ key: 'ArrowRight', mod: true }, 'MacIntel'), '\u2318+\u2192');
    assert.strictEqual(formatKey({ key: 'ArrowUp', mod: true }, 'MacIntel'), '\u2318+\u2191');
    assert.strictEqual(formatKey({ key: 'ArrowDown', mod: true }, 'MacIntel'), '\u2318+\u2193');
  });

  it('renders Esc for Escape', () => {
    assert.strictEqual(
      formatKey({ key: 'Escape', mod: false }, 'Win32'),
      'Esc'
    );
  });

  it('uppercases letter keys', () => {
    assert.strictEqual(formatKey({ key: 'f', mod: false }, 'MacIntel'), 'F');
    assert.strictEqual(formatKey({ key: 's', mod: true }, 'Win32'), 'Ctrl+S');
  });

  it('uppercases function keys', () => {
    assert.strictEqual(formatKey({ key: 'F3', mod: false }, 'MacIntel'), 'F3');
    assert.strictEqual(formatKey({ key: 'F1', mod: false }, 'Win32'), 'F1');
  });

  it('handles ? without mod', () => {
    assert.strictEqual(formatKey({ key: '?', mod: false }, 'MacIntel'), '?');
  });

  it('handles . with mod (stop all scans)', () => {
    assert.strictEqual(
      formatKey({ key: '.', mod: true }, 'MacIntel'),
      '\u2318+.'
    );
  });

  it('handles comma (settings) with mod', () => {
    assert.strictEqual(
      formatKey({ key: ',', mod: true }, 'Win32'),
      'Ctrl+,'
    );
  });
});
