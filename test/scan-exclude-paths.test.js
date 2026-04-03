const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/plugins.js scanPlugins resume excludePaths ──
function excludePathsForScan(resume, plugins) {
  return resume ? plugins.map(p => p.path) : null;
}

describe('excludePathsForScan', () => {
  it('null when not resume', () => {
    assert.strictEqual(excludePathsForScan(false, [{ path: '/a' }]), null);
  });

  it('paths when resume', () => {
    assert.deepStrictEqual(
      excludePathsForScan(true, [{ path: '/x' }, { path: '/y' }]),
      ['/x', '/y']
    );
  });
});
