const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('bulk JSON.parse(JSON.stringify(x)) === x', () => {
  it('12000 objects', () => {
    for (let i = 0; i < 12000; i++) {
      const x = {
        n: i,
        s: `k${i}`,
        a: [i, i + 1, i % 7],
        z: i % 2 === 0,
      };
      assert.deepStrictEqual(JSON.parse(JSON.stringify(x)), x);
    }
  });
});
