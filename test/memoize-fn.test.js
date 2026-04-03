const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const v = fn(...args);
    cache.set(key, v);
    return v;
  };
}

describe('memoize', () => {
  it('caches', () => {
    let n = 0;
    const f = memoize(x => {
      n++;
      return x * 2;
    });
    assert.strictEqual(f(3), 6);
    assert.strictEqual(f(3), 6);
    assert.strictEqual(n, 1);
  });
});
