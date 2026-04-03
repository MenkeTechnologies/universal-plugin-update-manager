const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/sort-persist.js (serialization only) ──
function serializeSortState(key, asc) {
  return JSON.stringify({ key, asc });
}

function parseSortState(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

describe('sort state serialization', () => {
  it('roundtrips key and asc', () => {
    const s = serializeSortState('name', true);
    assert.deepStrictEqual(parseSortState(s), { key: 'name', asc: true });
  });

  it('roundtrips false asc', () => {
    const s = serializeSortState('size', false);
    assert.deepStrictEqual(parseSortState(s), { key: 'size', asc: false });
  });

  it('parseSortState returns null for empty string', () => {
    assert.strictEqual(parseSortState(''), null);
  });

  it('parseSortState returns null for invalid JSON', () => {
    assert.strictEqual(parseSortState('{'), null);
    assert.strictEqual(parseSortState('not json'), null);
  });

  it('supports nested-compatible plain objects', () => {
    const s = JSON.stringify({ key: 'path', asc: true });
    assert.deepStrictEqual(parseSortState(s), { key: 'path', asc: true });
  });
});
