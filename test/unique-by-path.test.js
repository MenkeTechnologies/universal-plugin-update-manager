const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function uniquePaths(paths) {
  return [...new Set(paths)];
}

function mergeByPath(existing, incoming) {
  const seen = new Set(existing.map(x => x.path));
  const out = [...existing];
  for (const x of incoming) {
    if (!seen.has(x.path)) {
      out.push(x);
      seen.add(x.path);
    }
  }
  return out;
}

describe('uniquePaths', () => {
  it('dedupes', () => {
    assert.deepStrictEqual(uniquePaths(['/a', '/b', '/a']), ['/a', '/b']);
  });
});

describe('mergeByPath', () => {
  it('appends only new paths', () => {
    const m = mergeByPath([{ path: '/x' }], [{ path: '/y' }, { path: '/x' }]);
    assert.strictEqual(m.length, 2);
  });
});
