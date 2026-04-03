const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (a[k] !== b[k]) return false;
  return true;
}

describe('shallowEqual', () => {
  it('nested differs', () =>
    assert.strictEqual(shallowEqual({ x: { y: 1 } }, { x: { y: 1 } }), false));
});
