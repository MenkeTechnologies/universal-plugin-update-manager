const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function parseQuery(qs) {
  const out = {};
  const s = qs.replace(/^\?/, '');
  if (!s) return out;
  for (const part of s.split('&')) {
    const [k, v = ''] = part.split('=').map(decodeURIComponent);
    if (k) out[k] = v;
  }
  return out;
}

describe('parseQuery', () => {
  it('pairs', () => assert.deepStrictEqual(parseQuery('?a=1&b=two'), { a: '1', b: 'two' }));
  it('no leading', () => assert.deepStrictEqual(parseQuery('x=y'), { x: 'y' }));
});
