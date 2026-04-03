const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function naturalCompare(a, b) {
  const ax = [];
  const bx = [];
  a.replace(/(\d+)|(\D+)/g, (_, n, s) => ax.push(n ? +n : s));
  b.replace(/(\d+)|(\D+)/g, (_, n, s) => bx.push(n ? +n : s));
  for (let i = 0; i < Math.max(ax.length, bx.length); i++) {
    const na = ax[i];
    const nb = bx[i];
    if (na === undefined) return -1;
    if (nb === undefined) return 1;
    if (typeof na === typeof nb) {
      if (na < nb) return -1;
      if (na > nb) return 1;
    } else {
      return String(na).localeCompare(String(nb));
    }
  }
  return 0;
}

describe('naturalCompare', () => {
  it('numeric order', () => assert.ok(naturalCompare('file2', 'file10') < 0));
  it('padding', () => assert.ok(naturalCompare('a01', 'a2') < 0));
});
