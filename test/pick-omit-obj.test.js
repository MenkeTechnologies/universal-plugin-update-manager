const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function pick(obj, keys) {
  const o = {};
  for (const k of keys) if (k in obj) o[k] = obj[k];
  return o;
}

function omit(obj, keys) {
  const s = new Set(keys);
  const o = {};
  for (const k of Object.keys(obj)) if (!s.has(k)) o[k] = obj[k];
  return o;
}

describe('pick', () => {
  it('subset', () => assert.deepStrictEqual(pick({ a: 1, b: 2, c: 3 }, ['a', 'c']), { a: 1, c: 3 }));
});

describe('omit', () => {
  it('drops keys', () => assert.deepStrictEqual(omit({ a: 1, b: 2 }, ['b']), { a: 1 }));
});
