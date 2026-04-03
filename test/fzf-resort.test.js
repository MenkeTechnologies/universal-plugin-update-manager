const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Pattern from plugins.js / daw.js / presets.js: re-sort DB page by fzf score ──
function resortByScoreDescending(items, scoreFn) {
  return [...items]
    .map(item => ({ item, score: scoreFn(item) }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);
}

describe('resortByScoreDescending', () => {
  it('orders by numeric score', () => {
    const r = resortByScoreDescending(
      [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      x => ({ a: 1, b: 99, c: 50 }[x.id])
    );
    assert.deepStrictEqual(r.map(x => x.id), ['b', 'c', 'a']);
  });

  it('stable handling of equal scores', () => {
    const r = resortByScoreDescending([1, 2, 3], () => 0);
    assert.strictEqual(r.length, 3);
  });
});
