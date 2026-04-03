const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function fromRoman(s) {
  const m = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let t = 0;
  for (let i = 0; i < s.length; i++) {
    const v = m[s[i]];
    const n = m[s[i + 1]];
    if (n && v < n) t -= v;
    else t += v;
  }
  return t;
}

describe('fromRoman', () => {
  it('1994', () => assert.strictEqual(fromRoman('MCMXCIV'), 1994));
});
