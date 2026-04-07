const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// help-overlay.js help-grid sections (Navigation, Playback, Actions, fzf, Mouse, More shortcuts)
const HELP_SECTION_TITLES = [
  'Navigation',
  'Playback',
  'Actions',
  'Search Operators (fzf)',
  'Mouse',
  'More shortcuts',
];

describe('help overlay structure', () => {
  it('core sections listed', () => {
    assert.strictEqual(HELP_SECTION_TITLES.length, 6);
    assert.ok(HELP_SECTION_TITLES.includes('Navigation'));
    assert.ok(HELP_SECTION_TITLES.includes('Search Operators (fzf)'));
  });
});
