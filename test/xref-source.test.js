/**
 * Loads real utils.js + xref.js; validates xref format gate used before Rust extraction.
 */
const vm = require('vm');
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts, defaultDocument } = require('./frontend-vm-harness.js');

describe('frontend/js/xref.js (vm-loaded)', () => {
  let X;

  before(() => {
    X = loadFrontendScripts(['utils.js', 'xref.js'], {
      window: { vstUpdater: {} },
    });
  });

  it('isXrefSupported accepts all DAW formats wired for extraction', () => {
    const supported = [
      'ALS',
      'RPP',
      'RPP-BAK',
      'BWPROJECT',
      'SONG',
      'DAWPROJECT',
      'FLP',
      'LOGICX',
      'CPR',
      'NPR',
      'PTX',
      'PTF',
      'REASON',
    ];
    for (const fmt of supported) {
      assert.strictEqual(
        X.isXrefSupported(fmt),
        true,
        `expected ${fmt} supported`
      );
    }
  });

  it('isXrefSupported rejects non-project formats', () => {
    assert.strictEqual(X.isXrefSupported('WAV'), false);
    assert.strictEqual(X.isXrefSupported('MP3'), false);
    assert.strictEqual(X.isXrefSupported(''), false);
  });

  it('isXrefSupported is case-sensitive (matches Set keys from project format field)', () => {
    assert.strictEqual(X.isXrefSupported('als'), false);
    assert.strictEqual(X.isXrefSupported('ALS'), true);
  });
});

describe('frontend/js/xref.js findProjectsUsingPlugin (vm-loaded)', () => {
  let X;

  before(() => {
    X = loadFrontendScripts(['utils.js', 'xref.js'], {
      window: { vstUpdater: {} },
    });
  });

  it('matches xref rows without normalizedName via xrefPluginRefKey / normalizePluginName', () => {
    vm.runInContext(
      `
      for (const k of Object.keys(_xrefCache)) delete _xrefCache[k];
      _xrefCache['/p/a.als'] = [{ name: 'Serum (x64)', manufacturer: 'X', pluginType: 'VST3' }];
      `,
      X
    );
    X.allDawProjects = [];
    const hits = X.findProjectsUsingPlugin('Serum');
    assert.strictEqual(hits.length, 1);
    assert.strictEqual(hits[0].name, 'a.als');
    assert.strictEqual(hits[0].directory, '/p');
  });

  it('prefers allDawProjects row when the path is loaded', () => {
    vm.runInContext(
      `
      for (const k of Object.keys(_xrefCache)) delete _xrefCache[k];
      _xrefCache['/p/a.als'] = [{ name: 'Serum', normalizedName: 'serum', manufacturer: 'X', pluginType: 'VST3' }];
      `,
      X
    );
    X.allDawProjects = [{ path: '/p/a.als', name: 'Named', daw: 'Live', format: 'ALS' }];
    const hits = X.findProjectsUsingPlugin('Serum');
    assert.strictEqual(hits.length, 1);
    assert.strictEqual(hits[0].name, 'Named');
  });
});

describe('frontend/js/xref.js _searchTreeNodes (vm-loaded)', () => {
  let X;

  before(() => {
    X = loadFrontendScripts(['utils.js', 'xref.js'], {
      window: { vstUpdater: {} },
      document: {
        ...defaultDocument(),
        createTextNode: (t) => ({ nodeType: 3, textContent: t }),
      },
    });
  });

  it('empty query clears display and strips search-hl wrappers', () => {
    const node = { style: { display: 'none' }, querySelectorAll: () => [], firstChild: null };
    let hlReplaced = false;
    const hl = {
      textContent: 'hit',
      replaceWith() {
        hlReplaced = true;
      },
    };
    const container = {
      querySelectorAll(sel) {
        if (sel === '.xml-node') return [node];
        if (sel === '.search-hl') return [hl];
        return [];
      },
    };
    X._searchTreeNodes(container, '');
    assert.strictEqual(node.style.display, '');
    assert.strictEqual(hlReplaced, true);
  });

  it('non-empty query shows only matching nodes and highlights text', () => {
    const textEl = { textContent: 'SerumPlugin', innerHTML: '' };
    const node = {
      style: { display: 'none' },
      querySelectorAll(sel) {
        if (sel.includes('xml-tag') || sel.includes('json')) return [textEl];
        return [];
      },
      firstChild: null,
      parentElement: null,
    };
    const container = {
      querySelectorAll(sel) {
        if (sel === '.xml-node') return [node];
        if (sel === '.search-hl') return [];
        return [];
      },
    };
    X._searchTreeNodes(container, 'serum');
    assert.strictEqual(node.style.display, '');
    assert.ok(textEl.innerHTML.includes('mark') || textEl.innerHTML.includes('fzf-hl'));
  });
});
