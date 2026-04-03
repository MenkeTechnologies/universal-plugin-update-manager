const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function topoSort(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  for (const [a, b] of edges) {
    adj[a].push(b);
    indeg[b]++;
  }
  const q = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
  const out = [];
  while (q.length) {
    const u = q.shift();
    out.push(u);
    for (const v of adj[u]) {
      indeg[v]--;
      if (indeg[v] === 0) q.push(v);
    }
  }
  return out.length === n ? out : null;
}

describe('topoSort', () => {
  it('linear chain', () => assert.deepStrictEqual(topoSort(3, [[0, 1], [1, 2]]), [0, 1, 2]));

  it('cycle', () => assert.strictEqual(topoSort(2, [[0, 1], [1, 0]]), null));
});
