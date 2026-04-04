/**
 * Real multi-filter.js: updateMultiFilterLabel and syncMultiToSelect reflect Set state.
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts, defaultDocument } = require('./frontend-vm-harness.js');

describe('frontend/js/multi-filter.js (vm-loaded)', () => {
  let M;

  before(() => {
    M = loadFrontendScripts(['utils.js', 'multi-filter.js'], {
      document: {
        ...defaultDocument(),
        querySelectorAll: () => [],
        addEventListener: () => {},
      },
      showToast: () => {},
      toastFmt: () => {},
    });
  });

  it('updateMultiFilterLabel shows all label when nothing selected', () => {
    const label = { textContent: '', classList: { add: () => {}, remove: () => {} } };
    const wrapper = {
      _selected: new Set(),
      querySelector: (sel) => (sel === '.multi-filter-label' ? label : null),
    };
    M.updateMultiFilterLabel(wrapper, 'All types');
    assert.strictEqual(label.textContent, 'All types');
  });

  it('updateMultiFilterLabel shows value or count when one or many selected', () => {
    const label = { textContent: '', classList: { add: () => {}, remove: () => {} } };
    const wrapper = {
      _selected: new Set(['WAV']),
      querySelector: (sel) => (sel === '.multi-filter-label' ? label : null),
    };
    M.updateMultiFilterLabel(wrapper, 'All');
    assert.strictEqual(label.textContent, 'WAV');

    wrapper._selected.add('MP3');
    M.updateMultiFilterLabel(wrapper, 'All');
    assert.strictEqual(label.textContent, '2 selected');
  });

  it('syncMultiToSelect maps all vs first selected onto underlying select', () => {
    const select = { value: 'all' };
    const wrapper = {
      _selected: new Set(),
      _select: select,
    };
    M.syncMultiToSelect(wrapper);
    assert.strictEqual(select.value, 'all');

    wrapper._selected.add('vst3');
    wrapper._selected.add('au');
    M.syncMultiToSelect(wrapper);
    assert.strictEqual(select.value, 'vst3');
  });
});
