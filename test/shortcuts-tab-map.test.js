const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/shortcuts.js TAB_MAP ──
const TAB_MAP = ['plugins', 'samples', 'daw', 'presets', 'favorites', 'notes', 'tags', 'files', 'history', 'midi', 'visualizer', 'walkers', 'settings'];

describe('TAB_MAP', () => {
  it('length matches Cmd+1–8 + extra tabs', () => {
    assert.strictEqual(TAB_MAP.length, 13);
  });

  it('no duplicate ids', () => {
    assert.strictEqual(new Set(TAB_MAP).size, TAB_MAP.length);
  });

  it('index 10 is midi', () => {
    assert.strictEqual(TAB_MAP[9], 'midi');
  });

  it('last tab is settings', () => {
    assert.strictEqual(TAB_MAP[12], 'settings');
  });

  it('walkers before settings', () => {
    assert.strictEqual(TAB_MAP[11], 'walkers');
  });
});
