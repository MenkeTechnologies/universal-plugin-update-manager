const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

class UnionFind {
  constructor(n) {
    this.p = Array.from({ length: n }, (_, i) => i);
    this.r = new Array(n).fill(0);
  }
  find(x) {
    if (this.p[x] !== x) this.p[x] = this.find(this.p[x]);
    return this.p[x];
  }
  unite(a, b) {
    let pa = this.find(a);
    let pb = this.find(b);
    if (pa === pb) return false;
    if (this.r[pa] < this.r[pb]) [pa, pb] = [pb, pa];
    this.p[pb] = pa;
    if (this.r[pa] === this.r[pb]) this.r[pa]++;
    return true;
  }
}

describe('UnionFind', () => {
  it('connectivity', () => {
    const uf = new UnionFind(5);
    uf.unite(0, 1);
    uf.unite(3, 4);
    assert.strictEqual(uf.find(0), uf.find(1));
    assert.notStrictEqual(uf.find(0), uf.find(3));
    uf.unite(1, 3);
    assert.strictEqual(uf.find(0), uf.find(4));
  });
});
