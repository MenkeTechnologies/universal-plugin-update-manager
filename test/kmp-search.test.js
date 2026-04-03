const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function kmpSearch(text, pat) {
  const m = pat.length;
  const fail = new Array(m).fill(0);
  for (let i = 1, j = 0; i < m; i++) {
    while (j > 0 && pat[i] !== pat[j]) j = fail[j - 1];
    if (pat[i] === pat[j]) j++;
    fail[i] = j;
  }
  const out = [];
  for (let i = 0, j = 0; i < text.length; i++) {
    while (j > 0 && text[i] !== pat[j]) j = fail[j - 1];
    if (text[i] === pat[j]) j++;
    if (j === m) {
      out.push(i - m + 1);
      j = fail[j - 1];
    }
  }
  return out;
}

describe('kmpSearch', () => {
  it('overlap', () => assert.deepStrictEqual(kmpSearch('abababa', 'aba'), [0, 2, 4]));
});
