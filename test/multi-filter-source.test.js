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

  it('getMultiFilterValues returns null for missing select', () => {
    const M2 = loadFrontendScripts(['utils.js', 'multi-filter.js'], {
      document: {
        ...defaultDocument(),
        getElementById: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {},
      },
      showToast: () => {},
      toastFmt: () => {},
    });
    assert.strictEqual(M2.getMultiFilterValues('nope'), null);
  });

  it('getMultiFilterValues returns null when next sibling is not multi-filter', () => {
    const select = { id: 'f', nextElementSibling: { classList: { contains: () => false } } };
    const M2 = loadFrontendScripts(['utils.js', 'multi-filter.js'], {
      document: {
        ...defaultDocument(),
        getElementById: (id) => (id === 'f' ? select : null),
        querySelectorAll: () => [],
        addEventListener: () => {},
      },
      showToast: () => {},
      toastFmt: () => {},
    });
    assert.strictEqual(M2.getMultiFilterValues('f'), null);
  });

  it('getMultiFilterValues returns null when all selected (empty Set)', () => {
    const wrapper = {
      classList: { contains: (c) => c === 'multi-filter' },
      _selected: new Set(),
    };
    const select = { id: 'typeFilter', nextElementSibling: wrapper };
    const M2 = loadFrontendScripts(['utils.js', 'multi-filter.js'], {
      document: {
        ...defaultDocument(),
        getElementById: (id) => (id === 'typeFilter' ? select : null),
        querySelectorAll: () => [],
        addEventListener: () => {},
      },
      showToast: () => {},
      toastFmt: () => {},
    });
    assert.strictEqual(M2.getMultiFilterValues('typeFilter'), null);
  });

  it('getMultiFilterValues returns Set when specific values chosen', () => {
    const sel = new Set(['WAV', 'AIFF']);
    const wrapper = {
      classList: { contains: (c) => c === 'multi-filter' },
      _selected: sel,
    };
    const select = { id: 'audioFormatFilter', nextElementSibling: wrapper };
    const M2 = loadFrontendScripts(['utils.js', 'multi-filter.js'], {
      document: {
        ...defaultDocument(),
        getElementById: (id) => (id === 'audioFormatFilter' ? select : null),
        querySelectorAll: () => [],
        addEventListener: () => {},
      },
      showToast: () => {},
      toastFmt: () => {},
    });
    const out = M2.getMultiFilterValues('audioFormatFilter');
    assert.ok(out instanceof Set);
    assert.strictEqual(out.size, 2);
    assert.ok(out.has('WAV'));
  });
});
