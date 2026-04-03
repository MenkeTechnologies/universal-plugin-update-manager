const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/multi-filter.js triggerFilter action strings ──
const ACTIONS = new Set([
  'filterPlugins',
  'filterAudioSamples',
  'filterDawProjects',
  'filterPresets',
  'filterFavorites',
]);

function isKnownFilterAction(action) {
  return ACTIONS.has(action);
}

describe('triggerFilter actions', () => {
  it('covers main tabs', () => {
    assert.ok(isKnownFilterAction('filterPlugins'));
    assert.ok(isKnownFilterAction('filterAudioSamples'));
    assert.ok(isKnownFilterAction('filterDawProjects'));
    assert.ok(isKnownFilterAction('filterPresets'));
    assert.ok(isKnownFilterAction('filterFavorites'));
  });

  it('rejects unknown', () => {
    assert.strictEqual(isKnownFilterAction('filterUnknown'), false);
  });
});
