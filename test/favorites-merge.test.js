const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/favorites.js importFavorites merge ──
function mergeImportedFavorites(existingList, imported) {
  const seen = new Set(existingList.map(f => f.path));
  const out = [...existingList];
  let added = 0;
  for (const item of imported) {
    if (item.path && !seen.has(item.path)) {
      out.push(item);
      seen.add(item.path);
      added++;
    }
  }
  return { list: out, added, skipped: imported.length - added };
}

describe('mergeImportedFavorites', () => {
  it('adds new paths only', () => {
    const r = mergeImportedFavorites(
      [{ path: '/a', name: 'A' }],
      [{ path: '/b', name: 'B' }, { path: '/a', name: 'Dup' }]
    );
    assert.strictEqual(r.added, 1);
    assert.strictEqual(r.skipped, 1);
    assert.strictEqual(r.list.length, 2);
  });

  it('skips items without path', () => {
    const r = mergeImportedFavorites([], [{ name: 'no path' }]);
    assert.strictEqual(r.added, 0);
    assert.strictEqual(r.skipped, 1);
  });

  it('empty import', () => {
    const r = mergeImportedFavorites([{ path: '/x' }], []);
    assert.strictEqual(r.added, 0);
    assert.strictEqual(r.list.length, 1);
  });

  it('all new', () => {
    const r = mergeImportedFavorites([], [{ path: '/1' }, { path: '/2' }]);
    assert.strictEqual(r.added, 2);
    assert.strictEqual(r.skipped, 0);
  });

  it('preserves order of existing then appends', () => {
    const r = mergeImportedFavorites([{ path: 'first' }], [{ path: 'second' }]);
    assert.strictEqual(r.list[0].path, 'first');
    assert.strictEqual(r.list[1].path, 'second');
  });
});
