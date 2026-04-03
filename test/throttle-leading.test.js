const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function throttleLeading(fn, wait) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      return fn(...args);
    }
  };
}

describe('throttleLeading', () => {
  it('first fires', () => {
    let n = 0;
    const t = throttleLeading(() => {
      n++;
    }, 1000);
    t();
    assert.strictEqual(n, 1);
  });
});
