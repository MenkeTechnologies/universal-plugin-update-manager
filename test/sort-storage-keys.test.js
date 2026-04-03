const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/sort-persist.js key pattern ──
function sortStorageKey(tab) {
  return `sort_${tab}`;
}

describe('sortStorageKey', () => {
  it('builds prefs keys', () => {
    assert.strictEqual(sortStorageKey('audio'), 'sort_audio');
    assert.strictEqual(sortStorageKey('daw'), 'sort_daw');
    assert.strictEqual(sortStorageKey('preset'), 'sort_preset');
  });
});
