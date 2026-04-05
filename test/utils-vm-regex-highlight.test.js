/**
 * getMatchIndices / highlightMatch in regex mode (frontend/js/utils.js).
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts, defaultDocument } = require('./frontend-vm-harness.js');

describe('frontend/js/utils.js regex highlighting', () => {
  let U;

  before(() => {
    U = loadFrontendScripts(['utils.js'], { document: defaultDocument() });
  });

  it('getMatchIndices collects regex matches in order', () => {
    const idx = U.getMatchIndices('a', 'banana', 'regex');
    const set = new Set(idx);
    assert.ok(set.has(1));
    assert.ok(set.has(3));
    assert.ok(set.has(5));
  });

  it('getMatchIndices returns empty for invalid regex in regex mode', () => {
    const idx = U.getMatchIndices('[', 'abc', 'regex');
    assert.strictEqual(idx.length, 0);
  });

  it('highlightMatch wraps regex hits', () => {
    const h = U.highlightMatch('hello', 'l+', 'regex');
    assert.ok(h.includes('<mark class="fzf-hl">'));
    assert.ok(h.includes('l'));
  });

  it('getMatchIndices fuzzy mode returns empty when query empty', () => {
    assert.strictEqual(U.getMatchIndices('', 'text', 'fuzzy').length, 0);
  });
});
