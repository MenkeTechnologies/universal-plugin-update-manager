const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/utils.js _filterIds ──
const FILTER_IDS = [
  'typeFilter',
  'statusFilter',
  'favTypeFilter',
  'audioFormatFilter',
  'dawDawFilter',
  'presetFormatFilter',
];

describe('filter dropdown ids', () => {
  it('unique', () => {
    assert.strictEqual(new Set(FILTER_IDS).size, FILTER_IDS.length);
  });

  it('per-domain', () => {
    assert.ok(FILTER_IDS.includes('audioFormatFilter'));
    assert.ok(FILTER_IDS.includes('dawDawFilter'));
    assert.ok(FILTER_IDS.includes('presetFormatFilter'));
  });
});
