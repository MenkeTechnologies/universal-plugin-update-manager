const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function groupBy(arr, keyFn) {
  const m = new Map();
  for (const x of arr) {
    const k = keyFn(x);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(x);
  }
  return m;
}

describe('groupBy', () => {
  it('groups by key', () => {
    const g = groupBy([{ t: 'a', v: 1 }, { t: 'b', v: 2 }, { t: 'a', v: 3 }], x => x.t);
    assert.deepStrictEqual([...g.get('a')], [{ t: 'a', v: 1 }, { t: 'a', v: 3 }]);
    assert.strictEqual(g.get('b').length, 1);
  });
});
