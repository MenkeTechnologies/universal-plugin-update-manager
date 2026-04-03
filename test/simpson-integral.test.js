const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function simpson(f, a, b, n) {
  if (n % 2) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    s += f(x) * (i % 2 === 0 ? 2 : 4);
  }
  return (s * h) / 3;
}

describe('simpson', () => {
  it('x2', () => assert.ok(Math.abs(simpson(x => x * x, 0, 1, 100) - 1 / 3) < 1e-6));
});
