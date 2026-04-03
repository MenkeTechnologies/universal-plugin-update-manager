const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/duplicates.js ──
function findDuplicates(items, keyFn) {
  const groups = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return Object.values(groups).filter(g => g.length > 1);
}

describe('findDuplicates', () => {
  it('returns empty array when all keys unique', () => {
    assert.deepStrictEqual(
      findDuplicates([{ id: 1 }, { id: 2 }], x => x.id),
      []
    );
  });

  it('groups two items with same key', () => {
    const d = findDuplicates(
      [{ n: 'a', p: '/1' }, { n: 'a', p: '/2' }],
      x => x.n
    );
    assert.strictEqual(d.length, 1);
    assert.strictEqual(d[0].length, 2);
  });

  it('separate groups for different keys', () => {
    const d = findDuplicates(
      [
        { k: 'x', v: 1 },
        { k: 'x', v: 2 },
        { k: 'y', v: 3 },
        { k: 'y', v: 4 },
      ],
      x => x.k
    );
    assert.strictEqual(d.length, 2);
    assert.ok(d.every(g => g.length === 2));
  });

  it('ignores single-item groups', () => {
    const d = findDuplicates(
      [{ k: 'only' }, { k: 'a', v: 1 }, { k: 'a', v: 2 }],
      x => x.k
    );
    assert.strictEqual(d.length, 1);
    assert.strictEqual(d[0][0].k, 'a');
  });

  it('works with numeric keys', () => {
    const d = findDuplicates([{ s: 1 }, { s: 1 }, { s: 1 }], x => x.s);
    assert.strictEqual(d.length, 1);
    assert.strictEqual(d[0].length, 3);
  });

  it('works with composite string keys', () => {
    const d = findDuplicates(
      [
        { name: 'Kick', fmt: 'WAV' },
        { name: 'Kick', fmt: 'WAV' },
      ],
      x => `${x.name.toLowerCase()}.${x.fmt.toLowerCase()}`
    );
    assert.strictEqual(d.length, 1);
  });

  it('empty input', () => {
    assert.deepStrictEqual(findDuplicates([], x => x), []);
  });

  it('triple duplicate', () => {
    const d = findDuplicates([1, 1, 1, 2], x => x);
    assert.strictEqual(d.length, 1);
    assert.strictEqual(d[0].length, 3);
  });

  it('keyFn can use path prefix', () => {
    const d = findDuplicates(
      [{ p: '/a/x' }, { p: '/b/x' }],
      x => x.p.split('/').pop()
    );
    assert.strictEqual(d.length, 1);
  });

  it('preserves insertion order within group', () => {
    const items = [{ id: 1, t: 'dup' }, { id: 2, t: 'dup' }, { id: 3, t: 'dup' }];
    const d = findDuplicates(items, x => x.t);
    assert.deepStrictEqual(d[0].map(x => x.id), [1, 2, 3]);
  });
});

describe('findDuplicates (plugin-style keys)', () => {
  it('matches duplicates.js plugin key: lowercase name', () => {
    const d = findDuplicates(
      [{ name: 'Serum', path: '/a' }, { name: 'serum', path: '/b' }],
      p => p.name.toLowerCase()
    );
    assert.strictEqual(d.length, 1);
  });

  it('matches duplicates.js sample key pattern', () => {
    const d = findDuplicates(
      [
        { name: 'Loop', format: 'WAV', path: '/1' },
        { name: 'Loop', format: 'WAV', path: '/2' },
      ],
      s => `${s.name.toLowerCase()}.${s.format.toLowerCase()}`
    );
    assert.strictEqual(d.length, 1);
  });
});
