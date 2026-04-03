const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function rabinKarpFind(text, pat, base = 256, mod = 997) {
  const n = text.length;
  const m = pat.length;
  if (m > n) return [];
  let h = 0;
  let p = 0;
  let t = 0;
  const hi = Math.pow(base, m - 1) % mod;
  for (let i = 0; i < m; i++) {
    p = (p * base + pat.charCodeAt(i)) % mod;
    t = (t * base + text.charCodeAt(i)) % mod;
  }
  const out = [];
  for (let i = 0; i <= n - m; i++) {
    if (p === t && text.slice(i, i + m) === pat) out.push(i);
    if (i < n - m) {
      t = (base * (t - text.charCodeAt(i) * hi) + text.charCodeAt(i + m)) % mod;
      if (t < 0) t += mod;
    }
  }
  return out;
}

describe('rabinKarpFind', () => {
  it('find', () => assert.deepStrictEqual(rabinKarpFind('abcde', 'cd'), [2]));
});
