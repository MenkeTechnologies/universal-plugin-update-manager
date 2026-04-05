/**
 * buildDirsTable from frontend/js/utils.js — directory row counts + type badges.
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts, defaultDocument } = require('./frontend-vm-harness.js');

describe('frontend/js/utils.js buildDirsTable', () => {
  let U;

  before(() => {
    U = loadFrontendScripts(['utils.js'], {
      document: defaultDocument(),
      appTableCol: (k) => k,
    });
  });

  it('returns empty string when no directories', () => {
    assert.strictEqual(U.buildDirsTable([], []), '');
    assert.strictEqual(U.buildDirsTable(null, []), '');
  });

  it('counts plugins under each directory prefix', () => {
    const html = U.buildDirsTable(
      ['/Lib/Plugins', '/Other'],
      [
        { path: '/Lib/Plugins/a.vst3', type: 'VST3' },
        { path: '/Lib/Plugins/b.vst', type: 'VST2' },
        { path: '/Other/c.au', type: 'AU' },
      ]
    );
    assert.ok(html.includes('/Lib/Plugins'));
    assert.ok(html.includes('2</td>'));
    assert.ok(html.includes('/Other'));
    assert.ok(html.includes('1</td>'));
    assert.ok(html.includes('type-vst3'));
    assert.ok(html.includes('type-vst2'));
  });
});
