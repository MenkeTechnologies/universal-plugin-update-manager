const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/shortcuts.js formatKey (isMac injected for tests) ──
function formatKey(shortcut, isMac) {
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
  it('mod mac', () => {
    assert.strictEqual(formatKey({ key: 'k', mod: true }, true), '\u2318+K');
  });

  it('mod windows', () => {
    assert.strictEqual(formatKey({ key: 'k', mod: true }, false), 'Ctrl+K');
  });

  it('space', () => {
    assert.strictEqual(formatKey({ key: ' ', mod: false }, true), 'Space');
  });

  it('arrows', () => {
    assert.strictEqual(formatKey({ key: 'ArrowLeft', mod: true }, true), '\u2318+\u2190');
  });

  it('escape label', () => {
    assert.strictEqual(formatKey({ key: 'Escape', mod: false }, true), 'Esc');
  });
});
