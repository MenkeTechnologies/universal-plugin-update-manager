const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function sieve(n) {
  const isP = new Array(n + 1).fill(true);
  isP[0] = isP[1] = false;
  for (let i = 2; i * i <= n; i++) {
    if (isP[i]) for (let j = i * i; j <= n; j += i) isP[j] = false;
  }
  const out = [];
  for (let i = 2; i <= n; i++) if (isP[i]) out.push(i);
  return out;
}

describe('sieve', () => {
  it('under 30', () => {
    assert.deepStrictEqual(sieve(30), [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  });
});
