const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/multi-filter.js updateMultiFilterLabel ──
function multiFilterLabel(selectedSet, allLabel) {
  if (selectedSet.size === 0) {
    return { text: allLabel, active: false };
  }
  if (selectedSet.size === 1) {
    return { text: [...selectedSet][0], active: true };
  }
  return { text: `${selectedSet.size} selected`, active: true };
}

describe('multiFilterLabel', () => {
  it('all when empty selection', () => {
    const r = multiFilterLabel(new Set(), 'All types');
    assert.strictEqual(r.text, 'All types');
    assert.strictEqual(r.active, false);
  });

  it('single value', () => {
    const r = multiFilterLabel(new Set(['VST3']), 'All types');
    assert.strictEqual(r.text, 'VST3');
    assert.strictEqual(r.active, true);
  });

  it('multiple', () => {
    const r = multiFilterLabel(new Set(['WAV', 'AIFF', 'FLAC']), 'All formats');
    assert.strictEqual(r.text, '3 selected');
    assert.strictEqual(r.active, true);
  });

  it('two selected', () => {
    const r = multiFilterLabel(new Set(['a', 'b']), 'All');
    assert.strictEqual(r.text, '2 selected');
  });
});
