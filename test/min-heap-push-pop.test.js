const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

class MinHeap {
  constructor() {
    this.a = [];
  }
  push(x) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p] <= a[i]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    if (!a.length) return undefined;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l] < a[m]) m = l;
        if (r < a.length && a[r] < a[m]) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}

describe('MinHeap', () => {
  it('sorted', () => {
    const h = new MinHeap();
    [3, 1, 4, 1, 5].forEach(x => h.push(x));
    const out = [];
    while (h.a.length) out.push(h.pop());
    assert.deepStrictEqual(out, [1, 1, 3, 4, 5]);
  });
});
