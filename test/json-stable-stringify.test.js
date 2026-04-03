const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function stableStringify(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(stableStringify).join(',') + ']';
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(obj[k])).join(',') + '}';
}

describe('stableStringify', () => {
  it('key order', () => {
    assert.strictEqual(stableStringify({ b: 1, a: 2 }), '{"a":2,"b":1}');
  });
});
