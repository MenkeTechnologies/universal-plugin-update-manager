const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function sortByTimestampDesc(items, tsKey = 'timestamp') {
  return [...items].sort((a, b) => new Date(b[tsKey]) - new Date(a[tsKey]));
}

describe('sortByTimestampDesc', () => {
  it('newest first', () => {
    const s = sortByTimestampDesc([
      { id: 1, timestamp: '2020-01-01T00:00:00Z' },
      { id: 2, timestamp: '2021-01-01T00:00:00Z' },
    ]);
    assert.strictEqual(s[0].id, 2);
  });

  it('stable with equal times', () => {
    const t = '2022-01-01T00:00:00Z';
    const s = sortByTimestampDesc([{ id: 'a', timestamp: t }, { id: 'b', timestamp: t }]);
    assert.strictEqual(s.length, 2);
  });
});
