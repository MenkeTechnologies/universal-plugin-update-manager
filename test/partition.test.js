const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function partition(arr, pred) {
  const t = [];
  const f = [];
  for (const x of arr) (pred(x) ? t : f).push(x);
  return [t, f];
}

describe('partition', () => {
  it('splits', () => {
    const [ev, od] = partition([1, 2, 3, 4], n => n % 2 === 0);
    assert.deepStrictEqual(ev, [2, 4]);
    assert.deepStrictEqual(od, [1, 3]);
  });
});
