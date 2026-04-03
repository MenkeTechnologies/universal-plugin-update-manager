const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function lcp(strs) {
  if (strs.length === 0) return '';
  let p = strs[0];
  for (let i = 1; i < strs.length; i++) {
    const s = strs[i];
    let j = 0;
    while (j < p.length && j < s.length && p[j] === s[j]) j++;
    p = p.slice(0, j);
    if (p === '') return '';
  }
  return p;
}

describe('lcp', () => {
  it('common', () => assert.strictEqual(lcp(['flower', 'flow', 'flight']), 'fl'));
  it('none', () => assert.strictEqual(lcp(['dog', 'race', 'car']), ''));
});
