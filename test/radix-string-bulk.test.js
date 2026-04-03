const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

/** Same algorithm as `history::radix_string` (Rust). */
function radixString(n, base) {
  if (n === 0) return '0';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  const out = [];
  let m = n;
  while (m > 0) {
    out.push(chars[m % base]);
    m = Math.floor(m / base);
  }
  return out.reverse().join('');
}

describe('radixString vs Number.toString (bulk)', () => {
  const bases = [2, 3, 4, 8, 10, 12, 16, 20, 32, 36];
  for (const base of bases) {
    for (let n = 0; n < 120; n++) {
      it(`base ${base} n ${n}`, () => {
        const got = radixString(n, base);
        assert.equal(got, n.toString(base), 'must match ECMAScript integer string conversion');
      });
    }
  }
});
