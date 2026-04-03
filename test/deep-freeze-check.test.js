const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function isFrozenDeep(x, seen = new WeakSet()) {
  if (x === null || typeof x !== 'object') return true;
  if (seen.has(x)) return true;
  seen.add(x);
  if (!Object.isFrozen(x)) return false;
  for (const k of Object.keys(x)) {
    if (!isFrozenDeep(x[k], seen)) return false;
  }
  return true;
}

describe('isFrozenDeep', () => {
  it('primitives', () => assert.strictEqual(isFrozenDeep(1), true));
  it('mutable object', () => assert.strictEqual(isFrozenDeep({}), false));
  it('frozen object', () => assert.strictEqual(isFrozenDeep(Object.freeze({})), true));
  it('frozen array', () => assert.strictEqual(isFrozenDeep([].freeze && [].freeze() || []), false));
  it('nested mutable', () => {
    const obj = { a: { b: {} } };
    assert.strictEqual(isFrozenDeep(obj), false);
  });
  it('nested frozen', () => {
    const obj = Object.freeze({ a: Object.freeze({ b: Object.freeze({} ) }) });
    assert.strictEqual(isFrozenDeep(obj), true);
  });
  it('mixed frozen', () => {
    const obj = Object.freeze({ a: { b: {} } });
    assert.strictEqual(isFrozenDeep(obj), false);
  });
  it('null', () => assert.strictEqual(isFrozenDeep(null), true));
  it('undefined', () => assert.strictEqual(isFrozenDeep(), true));
  it('array', () => assert.strictEqual(isFrozenDeep([1, 2, 3]), false));
  it('frozen array', () => {
    const arr = Object.freeze([1, 2, 3]);
    assert.strictEqual(isFrozenDeep(arr), true);
  });
  it('array with mutable object', () => {
    const arr = [{ a: {} }];
    assert.strictEqual(isFrozenDeep(arr), false);
  });
});
