const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/daw.js fetchDawPage daw_filter ──
function singleDawFromSet(dawSet) {
  if (dawSet && dawSet.size === 1) return [...dawSet][0];
  return null;
}

describe('singleDawFromSet', () => {
  it('null when unset or multi', () => {
    assert.strictEqual(singleDawFromSet(null), null);
    assert.strictEqual(singleDawFromSet(new Set()), null);
    assert.strictEqual(singleDawFromSet(new Set(['A', 'B'])), null);
  });

  it('returns one DAW', () => {
    assert.strictEqual(singleDawFromSet(new Set(['Ableton Live'])), 'Ableton Live');
  });
});
