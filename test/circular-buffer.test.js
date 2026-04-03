const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

class CircularBuffer {
  constructor(cap) {
    this.cap = cap;
    this.buf = new Array(cap);
    this.head = 0;
    this.len = 0;
  }
  push(x) {
    const i = (this.head + this.len) % this.cap;
    if (this.len < this.cap) {
      this.buf[i] = x;
      this.len++;
    } else {
      this.buf[i] = x;
      this.head = (this.head + 1) % this.cap;
    }
  }
  toArray() {
    const out = [];
    for (let k = 0; k < this.len; k++) out.push(this.buf[(this.head + k) % this.cap]);
    return out;
  }
}

describe('CircularBuffer', () => {
  it('overwrite', () => {
    const b = new CircularBuffer(2);
    b.push(1);
    b.push(2);
    b.push(3);
    assert.deepStrictEqual(b.toArray(), [2, 3]);
  });
});
