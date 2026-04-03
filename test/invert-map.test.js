const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function invertMap(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[String(v)] = k;
  }
  return out;
}

describe('invertMap', () => {
  it('swaps keys and values', () => {
    assert.deepStrictEqual(invertMap({ a: 1, b: 2 }), { 1: 'a', 2: 'b' });
  });
});
