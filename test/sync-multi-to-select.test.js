const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/multi-filter.js syncMultiToSelect ──
function syncMultiToSelect(selectedSet, fallbackAll) {
  if (selectedSet.size === 0) return { value: 'all' };
  return { value: [...selectedSet][0] };
}

describe('syncMultiToSelect', () => {
  it('all when empty', () => {
    assert.deepStrictEqual(syncMultiToSelect(new Set(), true), { value: 'all' });
  });

  it('first selected when non-empty', () => {
    assert.deepStrictEqual(syncMultiToSelect(new Set(['b', 'a']), false), { value: 'b' });
  });
});
