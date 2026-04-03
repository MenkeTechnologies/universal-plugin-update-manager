const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function once(fn) {
  let done = false;
  let val;
  return (...args) => {
    if (!done) {
      done = true;
      val = fn(...args);
    }
    return val;
  };
}

describe('once', () => {
  it('single', () => {
    let c = 0;
    const f = once(() => ++c);
    assert.strictEqual(f(), 1);
    assert.strictEqual(f(), 1);
    assert.strictEqual(c, 1);
  });
});
