const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/sort-persist.js key / payload ──
function sortStorageKey(tab) {
  return `sort_${tab}`;
}

function serializeSortState(key, asc) {
  return JSON.stringify({ key, asc });
}

function parseSortState(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

describe('sort state persistence', () => {
  it('storage key per tab', () => {
    assert.strictEqual(sortStorageKey('audio'), 'sort_audio');
    assert.strictEqual(sortStorageKey('daw'), 'sort_daw');
  });

  it('roundtrip', () => {
    const s = serializeSortState('name', false);
    assert.deepStrictEqual(parseSortState(s), { key: 'name', asc: false });
  });

  it('invalid json returns null', () => {
    assert.strictEqual(parseSortState('{'), null);
  });
});
