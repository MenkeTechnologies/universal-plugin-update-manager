const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function dijkstra(n, edges, start) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) {
    adj[u].push([v, w]);
    adj[v].push([u, w]);
  }
  const dist = new Array(n).fill(Infinity);
  dist[start] = 0;
  const seen = new Array(n).fill(false);
  for (let _ = 0; _ < n; _++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!seen[i] && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0 || dist[u] === Infinity) break;
    seen[u] = true;
    for (const [v, w] of adj[u]) {
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }
  return dist;
}

describe('dijkstra', () => {
  it('triangle', () => {
    const d = dijkstra(
      3,
      [
        [0, 1, 1],
        [1, 2, 2],
        [0, 2, 10],
      ],
      0
    );
    assert.strictEqual(d[2], 3);
  });
});
