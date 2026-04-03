const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function zip(a, b) {
  const n = Math.min(a.length, b.length);
  const out = [];
  for (let i = 0; i < n; i++) out.push([a[i], b[i]]);
  return out;
}

describe('zip', () => {
  it('truncates to shorter', () => {
    assert.deepStrictEqual(zip([1, 2, 3], ['a', 'b']), [
      [1, 'a'],
      [2, 'b'],
    ]);
  });
});
