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
});
