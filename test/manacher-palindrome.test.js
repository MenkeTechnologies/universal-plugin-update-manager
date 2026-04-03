const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function longestPalindrome(s) {
  if (!s.length) return '';
  const t = '^#' + [...s].join('#') + '#$';
  const p = new Array(t.length).fill(0);
  let c = 0;
  let r = 0;
  let maxLen = 0;
  let center = 0;
  for (let i = 1; i < t.length - 1; i++) {
    const mirror = 2 * c - i;
    if (i < r) p[i] = Math.min(r - i, p[mirror]);
    while (t[i + (1 + p[i])] === t[i - (1 + p[i])]) p[i]++;
    if (i + p[i] > r) {
      c = i;
      r = i + p[i];
    }
    if (p[i] > maxLen) {
      maxLen = p[i];
      center = i;
    }
  }
  const start = (center - maxLen) >> 1;
  return s.slice(start, start + maxLen);
}

describe('longestPalindrome', () => {
  it('babad', () => assert.ok(['bab', 'aba'].includes(longestPalindrome('babad'))));
});
