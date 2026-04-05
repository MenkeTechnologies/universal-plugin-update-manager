/**
 * Real modal-drag.js: initModalDragResize + restoreGeometry prefs validation (vm-loaded).
 * IIFE registers MutationObserver and listeners; we only exercise the exported initializer.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadModalDragVm(store) {
  const prefsStore = store || {};
  const sandbox = {
    console,
    prefs: {
      getItem(k) {
        return Object.prototype.hasOwnProperty.call(prefsStore, k) ? prefsStore[k] : null;
      },
      setItem(k, v) {
        prefsStore[k] = v;
      },
    },
    showToast: () => {},
    MutationObserver: class {
      constructor() {}
      observe() {}
      disconnect() {}
    },
    getComputedStyle: () => ({ position: 'relative' }),
    document: {
      body: { insertAdjacentHTML: () => {} },
      createElement: () => ({
        className: '',
        classList: { add: () => {}, contains: () => false },
        appendChild: () => {},
        dataset: {},
        style: {},
      }),
      addEventListener: () => {},
    },
    window: {},
  };
  sandbox.window = sandbox;
  sandbox.window.innerWidth = 1920;
  sandbox.window.innerHeight = 1080;
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '..', 'frontend', 'js', 'modal-drag.js'), 'utf8'),
    sandbox
  );
  return sandbox;
}

function makeModal(opts) {
  const o = opts || {};
  const style = o.style || {};
  const overlay = Object.prototype.hasOwnProperty.call(o, 'overlay')
    ? o.overlay
    : { id: 'dupModal', style: { alignItems: '', justifyContent: '' } };
  const modalBody = { style: { maxHeight: '' } };
  const modalHeader = { offsetHeight: 40, style: { cursor: '' }, addEventListener: () => {} };
  return {
    id: o.id || '',
    classList: { contains: (c) => c === 'modal-content' },
    _dragInit: false,
    closest(sel) {
      if (sel === '.modal-overlay') return overlay;
      if (sel === '[id]') return null;
      return null;
    },
    style,
    getBoundingClientRect: () => ({ left: 100, top: 80, width: 500, height: 400 }),
    querySelector(sel) {
      if (sel === '.modal-body') return modalBody;
      if (sel === '.modal-header') return modalHeader;
      return null;
    },
    appendChild: () => {},
    addEventListener: () => {},
  };
}

describe('frontend/js/modal-drag.js initModalDragResize (vm-loaded)', () => {
  it('restoreGeometry applies prefs when JSON is valid and within viewport', () => {
    const store = {
      modal_dupModal: JSON.stringify({
        left: 120,
        top: 90,
        width: 520,
        height: 420,
      }),
    };
    const S = loadModalDragVm(store);
    const modal = makeModal({});
    S.initModalDragResize(modal);
    assert.strictEqual(modal.style.position, 'fixed');
    assert.strictEqual(modal.style.left, '120px');
    assert.strictEqual(modal.style.top, '90px');
    assert.strictEqual(modal.style.width, '520px');
    assert.strictEqual(modal.style.height, '420px');
  });

  it('restoreGeometry ignores prefs when left is negative', () => {
    const store = {
      modal_dupModal: JSON.stringify({ left: -1, top: 10, width: 400, height: 300 }),
    };
    const S = loadModalDragVm(store);
    const modal = makeModal({});
    S.initModalDragResize(modal);
    assert.strictEqual(modal.style.left, undefined);
    assert.strictEqual(modal.style.position, 'relative');
  });

  it('restoreGeometry ignores prefs when width or height below minimum', () => {
    const store = {
      modal_dupModal: JSON.stringify({ left: 10, top: 10, width: 199, height: 300 }),
    };
    const S = loadModalDragVm(store);
    const modal = makeModal({});
    S.initModalDragResize(modal);
    assert.strictEqual(modal.style.width, undefined);
  });

  it('restoreGeometry uses modal id when no overlay (getModalKey fallback)', () => {
    const store = {
      modal_soloModal: JSON.stringify({
        left: 50,
        top: 60,
        width: 400,
        height: 320,
      }),
    };
    const S = loadModalDragVm(store);
    const modal = makeModal({ id: 'soloModal', overlay: null });
    modal.closest = () => null;
    S.initModalDragResize(modal);
    assert.strictEqual(modal.style.left, '50px');
    assert.strictEqual(modal.style.position, 'fixed');
  });

  it('skips restoreGeometry for audioNowPlaying (dock-managed)', () => {
    const store = {
      modal_audioNowPlaying: JSON.stringify({
        left: 10,
        top: 10,
        width: 500,
        height: 400,
      }),
    };
    const S = loadModalDragVm(store);
    const modal = makeModal({ id: 'audioNowPlaying' });
    S.initModalDragResize(modal);
    assert.strictEqual(modal.style.left, undefined);
    assert.strictEqual(modal.style.position, 'relative');
  });

  it('invalid JSON in prefs does not throw; init completes', () => {
    const store = { modal_dupModal: 'not-json{' };
    const S = loadModalDragVm(store);
    const modal = makeModal({});
    assert.doesNotThrow(() => S.initModalDragResize(modal));
    assert.strictEqual(modal.style.left, undefined);
  });
});
