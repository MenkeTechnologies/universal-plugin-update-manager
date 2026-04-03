const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function cartesian(a, b) {
  const out = [];
  for (const x of a) for (const y of b) out.push([x, y]);
  return out;
}

describe('cartesian', () => {
  it('pairs', () => {
    assert.deepStrictEqual( cartesian([1, 2], ['a', 'b']), [
      [1, 'a'],
      [1, 'b'],
      [2, 'a'],
      [2, 'b'],
    ]);
  });
});
