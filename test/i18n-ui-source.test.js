/**
 * Real i18n-ui.js: applyUiI18n fills text, placeholder, and title from window.__appStr.
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts } = require('./frontend-vm-harness.js');

describe('frontend/js/i18n-ui.js applyUiI18n (vm-loaded)', () => {
  let I;
  let e1;
  let e2;
  let e3;

  before(() => {
    e1 = { dataset: { i18n: 'app.title' }, textContent: 'old', placeholder: '', title: '' };
    e2 = { dataset: { i18nPlaceholder: 'app.searchPh' }, textContent: '', placeholder: 'ph', title: '' };
    e3 = { dataset: { i18nTitle: 'app.saveTip' }, textContent: '', placeholder: '', title: 'oldtip' };
    I = loadFrontendScripts(['i18n-ui.js'], {
      __appStr: {
        'app.title': 'Audio Haxor',
        'app.searchPh': 'Search plugins…',
        'app.saveTip': 'Save changes',
      },
      document: {
        querySelectorAll(sel) {
          if (sel === '[data-i18n]') return [e1];
          if (sel === '[data-i18n-placeholder]') return [e2];
          if (sel === '[data-i18n-title]') return [e3];
          return [];
        },
        createElement: () => ({}),
        getElementById: () => null,
        addEventListener: () => {},
        body: { insertAdjacentHTML: () => {} },
      },
    });
  });

  it('replaces textContent, placeholder, and title when keys exist and non-empty', () => {
    I.applyUiI18n();
    assert.strictEqual(e1.textContent, 'Audio Haxor');
    assert.strictEqual(e2.placeholder, 'Search plugins…');
    assert.strictEqual(e3.title, 'Save changes');
  });

  it('skips keys that are missing or empty in __appStr', () => {
    const el = { dataset: { i18n: 'missing.key' }, textContent: 'unchanged' };
    const J = loadFrontendScripts(['i18n-ui.js'], {
      __appStr: { other: 'x' },
      document: {
        querySelectorAll(sel) {
          if (sel === '[data-i18n]') return [el];
          return [];
        },
        createElement: () => ({}),
        getElementById: () => null,
        addEventListener: () => {},
        body: { insertAdjacentHTML: () => {} },
      },
    });
    J.applyUiI18n();
    assert.strictEqual(el.textContent, 'unchanged');
  });

  it('does not overwrite when map value is empty string', () => {
    const el = { dataset: { i18n: 'k.empty' }, textContent: 'keep' };
    const J = loadFrontendScripts(['i18n-ui.js'], {
      __appStr: { 'k.empty': '' },
      document: {
        querySelectorAll(sel) {
          if (sel === '[data-i18n]') return [el];
          return [];
        },
        createElement: () => ({}),
        getElementById: () => null,
        addEventListener: () => {},
        body: { insertAdjacentHTML: () => {} },
      },
    });
    J.applyUiI18n();
    assert.strictEqual(el.textContent, 'keep');
  });

  it('null __appStr falls back to {} so no keys apply', () => {
    const el = { dataset: { i18n: 'x' }, textContent: 'orig' };
    const J = loadFrontendScripts(['i18n-ui.js'], {
      __appStr: null,
      document: {
        querySelectorAll() {
          return [el];
        },
        createElement: () => ({}),
        getElementById: () => null,
        addEventListener: () => {},
        body: { insertAdjacentHTML: () => {} },
      },
    });
    J.applyUiI18n();
    assert.strictEqual(el.textContent, 'orig');
  });

  it('returns early when __appStr is a non-object (e.g. string)', () => {
    const el = { dataset: { i18n: 'x' }, textContent: 'orig' };
    const J = loadFrontendScripts(['i18n-ui.js'], {
      __appStr: 'bad',
      document: {
        querySelectorAll() {
          return [el];
        },
        createElement: () => ({}),
        getElementById: () => null,
        addEventListener: () => {},
        body: { insertAdjacentHTML: () => {} },
      },
    });
    J.applyUiI18n();
    assert.strictEqual(el.textContent, 'orig');
  });

  it('decodes &#10; / &#13; in placeholder strings to newlines (settings textareas)', () => {
    const ta = {
      dataset: { i18nPlaceholder: 'ui.ph.path_to_plugins_10_another_path' },
      placeholder: '',
      title: '',
    };
    const J = loadFrontendScripts(['i18n-ui.js'], {
      __appStr: {
        'ui.ph.path_to_plugins_10_another_path': '/a&#10;/b',
      },
      document: {
        querySelectorAll(sel) {
          if (sel === '[data-i18n-placeholder]') return [ta];
          return [];
        },
        createElement: () => ({}),
        getElementById: () => null,
        addEventListener: () => {},
        body: { insertAdjacentHTML: () => {} },
      },
    });
    J.applyUiI18n();
    assert.strictEqual(ta.placeholder, '/a\n/b');
  });

  it('applyI18nPlaceholders uses regex key when .btn-regex is active in .search-box', () => {
    const input = {
      dataset: {
        i18nPlaceholder: 'ph.fuzzy',
        i18nPlaceholderRegex: 'ph.regex',
      },
      placeholder: '',
      closest: () => ({
        querySelector: (sel) => (sel === '.btn-regex' ? { classList: { contains: (c) => c === 'active' } } : null),
      }),
    };
    const J = loadFrontendScripts(['i18n-ui.js'], {
      __appStr: {
        'ph.fuzzy': 'fuzzy text',
        'ph.regex': 'regex mode',
      },
      document: {
        querySelectorAll(sel) {
          if (sel === '[data-i18n-placeholder]') return [input];
          return [];
        },
        createElement: () => ({}),
        getElementById: () => null,
        addEventListener: () => {},
        body: { insertAdjacentHTML: () => {} },
      },
    });
    J.applyI18nPlaceholders();
    assert.strictEqual(input.placeholder, 'regex mode');
  });

  it('applyI18nPlaceholders keeps fuzzy key when regex sibling is inactive', () => {
    const input = {
      dataset: { i18nPlaceholder: 'ph.fuzzy', i18nPlaceholderRegex: 'ph.regex' },
      placeholder: '',
      closest: () => ({
        querySelector: () => ({ classList: { contains: () => false } }),
      }),
    };
    const J = loadFrontendScripts(['i18n-ui.js'], {
      __appStr: { 'ph.fuzzy': 'fuzzy only', 'ph.regex': 'regex only' },
      document: {
        querySelectorAll(sel) {
          if (sel === '[data-i18n-placeholder]') return [input];
          return [];
        },
        createElement: () => ({}),
        getElementById: () => null,
        addEventListener: () => {},
        body: { insertAdjacentHTML: () => {} },
      },
    });
    J.applyI18nPlaceholders();
    assert.strictEqual(input.placeholder, 'fuzzy only');
  });

  it('TITLE + __appBuildVersion appends default version line', () => {
    const titleEl = {
      tagName: 'TITLE',
      dataset: { i18n: 'app.title' },
      textContent: 'old',
    };
    const J = loadFrontendScripts(['i18n-ui.js'], {
      __appStr: { 'app.title': 'Audio Haxor' },
      __appBuildVersion: '9.9.9',
      document: {
        querySelectorAll(sel) {
          if (sel === '[data-i18n]') return [titleEl];
          return [];
        },
        createElement: () => ({}),
        getElementById: () => null,
        addEventListener: () => {},
        body: { insertAdjacentHTML: () => {} },
      },
    });
    J.applyUiI18n();
    assert.strictEqual(titleEl.textContent, 'Audio Haxor · Version: v9.9.9');
  });

  it('TITLE uses formatBuildMetaLine when provided', () => {
    const titleEl = {
      tagName: 'TITLE',
      dataset: { i18n: 'app.title' },
      textContent: 'old',
    };
    const J = loadFrontendScripts(['i18n-ui.js'], {
      __appStr: { 'app.title': 'App' },
      __appBuildVersion: '1.0.0',
      __appBuildInfo: { channel: 'beta' },
      formatBuildMetaLine: (info) => `ch=${info.channel}`,
      document: {
        querySelectorAll(sel) {
          if (sel === '[data-i18n]') return [titleEl];
          return [];
        },
        createElement: () => ({}),
        getElementById: () => null,
        addEventListener: () => {},
        body: { insertAdjacentHTML: () => {} },
      },
    });
    J.applyUiI18n();
    assert.strictEqual(titleEl.textContent, 'App · ch=beta');
  });
});
