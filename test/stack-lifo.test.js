const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

class Stack {
  constructor() {
    this._a = [];
  }
  push(x) {
    this._a.push(x);
  }
  pop() {
    return this._a.pop();
  }
  peek() {
    return this._a[this._a.length - 1];
  }
}

describe('Stack', () => {
  it('lifo', () => {
    const s = new Stack();
    s.push(1);
    s.push(2);
    assert.strictEqual(s.pop(), 2);
    assert.strictEqual(s.peek(), 1);
  });
});
