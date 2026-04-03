const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

class Queue {
  constructor() {
    this._a = [];
    this._i = 0;
  }
  push(x) {
    this._a.push(x);
  }
  shift() {
    if (this._i >= this._a.length) return undefined;
    const x = this._a[this._i];
    this._i++;
    if (this._i > 1024) {
      this._a = this._a.slice(this._i);
      this._i = 0;
    }
    return x;
  }
  get length() {
    return this._a.length - this._i;
  }
}

describe('Queue', () => {
  it('fifo', () => {
    const q = new Queue();
    q.push(1);
    q.push(2);
    assert.strictEqual(q.shift(), 1);
    assert.strictEqual(q.shift(), 2);
  });
});
