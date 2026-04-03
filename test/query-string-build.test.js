const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function buildQuery(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

describe('buildQuery', () => {
  it('roundtrip-ish', () => {
    const q = buildQuery({ foo: 'bar baz', n: 1 });
    assert.ok(q.includes('foo'));
    assert.ok(q.includes('bar'));
  });
});
