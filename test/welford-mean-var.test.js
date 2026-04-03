const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

class Welford {
  constructor() {
    this.n = 0;
    this.mean = 0;
    this.m2 = 0;
  }
  push(x) {
    this.n++;
    const d = x - this.mean;
    this.mean += d / this.n;
    const d2 = x - this.mean;
    this.m2 += d * d2;
  }
  variance() {
    return this.n > 1 ? this.m2 / (this.n - 1) : 0;
  }
}

describe('Welford', () => {
  it('variance', () => {
    const w = new Welford();
    [2, 4, 4, 4, 5, 5, 7, 9].forEach(x => w.push(x));
    assert.ok(Math.abs(w.variance() - 4.57142857) < 0.01);
  });
});
