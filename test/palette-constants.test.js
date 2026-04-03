const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/command-palette.js ──
const PALETTE_MAX = 50;

const PALETTE_TAB_IDS = [
  'plugins',
  'samples',
  'daw',
  'presets',
  'favorites',
  'notes',
  'tags',
  'history',
  'files',
  'visualizer',
  'walkers',
  'midi',
  'settings',
];

describe('command palette constants', () => {
  it('PALETTE_MAX is positive cap', () => {
    assert.strictEqual(PALETTE_MAX, 50);
  });

  it('tab shortcuts cover main views', () => {
    assert.strictEqual(PALETTE_TAB_IDS.length, 13);
    assert.ok(PALETTE_TAB_IDS.includes('plugins'));
    assert.ok(PALETTE_TAB_IDS.includes('midi'));
    assert.ok(PALETTE_TAB_IDS.includes('settings'));
    assert.strictEqual(new Set(PALETTE_TAB_IDS).size, PALETTE_TAB_IDS.length);
  });
});
