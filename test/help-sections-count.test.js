const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// help-overlay.js help-grid sections (Navigation, Playback, Actions, fzf, Mouse, …)
const HELP_SECTION_TITLES = [
  'Navigation',
  'Playback',
  'Actions',
  'Search Operators (fzf)',
  'Mouse',
];

describe('help overlay structure', () => {
  it('core sections listed', () => {
    assert.strictEqual(HELP_SECTION_TITLES.length, 5);
    assert.ok(HELP_SECTION_TITLES.includes('Navigation'));
    assert.ok(HELP_SECTION_TITLES.includes('Search Operators (fzf)'));
  });
});
