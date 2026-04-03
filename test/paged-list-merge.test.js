const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── plugins.js / daw.js / presets.js: offset 0 replaces, else append ──
function mergePagedResults(offset, previous, page) {
  if (offset === 0) return page;
  return [...previous, ...page];
}

describe('mergePagedResults', () => {
  it('replaces on first page', () => {
    assert.deepStrictEqual(mergePagedResults(0, [{ id: 1 }], [{ id: 2 }]), [{ id: 2 }]);
  });

  it('appends on later pages', () => {
    assert.deepStrictEqual(
      mergePagedResults(500, [{ id: 1 }], [{ id: 2 }]),
      [{ id: 1 }, { id: 2 }]
    );
  });
});
