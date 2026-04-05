/**
 * btnLoading toggles class and disabled on a button-like object (frontend/js/utils.js).
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts, defaultDocument } = require('./frontend-vm-harness.js');

describe('frontend/js/utils.js btnLoading', () => {
  let U;

  before(() => {
    U = loadFrontendScripts(['utils.js'], { document: defaultDocument() });
  });

  it('no-ops on null', () => {
    assert.doesNotThrow(() => U.btnLoading(null, true));
  });

  it('sets loading state', () => {
    const added = [];
    const removed = [];
    const btn = {
      disabled: false,
      classList: {
        add: (c) => added.push(c),
        remove: (c) => removed.push(c),
      },
    };
    U.btnLoading(btn, true);
    assert.ok(added.includes('btn-loading'));
    assert.strictEqual(btn.disabled, true);
    U.btnLoading(btn, false);
    assert.ok(removed.includes('btn-loading'));
    assert.strictEqual(btn.disabled, false);
  });
});
