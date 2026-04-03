const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const MAP = { B: 1, F: 1, P: 1, V: 1, C: 2, G: 2, J: 2, K: 2, Q: 2, S: 2, X: 2, Z: 2, D: 3, T: 3, L: 4, M: 5, N: 5, R: 6 };

function soundex(s) {
  const u = s.toUpperCase().replace(/[^A-Z]/g, '');
  if (!u) return '';
  let out = u[0];
  let prev = MAP[u[0]];
  for (let i = 1; i < u.length && out.length < 4; i++) {
    const c = MAP[u[i]];
    if (c && c !== prev) out += c;
    prev = c || prev;
  }
  return (out + '000').slice(0, 4);
}

describe('soundex', () => {
  it('Robert Rubin', () => assert.strictEqual(soundex('Robert'), soundex('Rupert')));
});
