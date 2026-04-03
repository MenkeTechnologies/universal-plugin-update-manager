const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/history.js loadHistory merge ──
function mergeScanHistory(pluginScans, audioScans, dawScans, presetScans) {
  return [
    ...pluginScans.map(s => ({ ...s, _type: 'plugin' })),
    ...audioScans.map(s => ({ ...s, _type: 'audio' })),
    ...dawScans.map(s => ({ ...s, _type: 'daw' })),
    ...presetScans.map(s => ({ ...s, _type: 'preset' })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

describe('mergeScanHistory', () => {
  it('tags scan types', () => {
    const m = mergeScanHistory(
      [{ id: 1, timestamp: '2020-01-01T00:00:00Z' }],
      [],
      [],
      []
    );
    assert.strictEqual(m[0]._type, 'plugin');
  });

  it('sorts newest first', () => {
    const m = mergeScanHistory(
      [{ id: 'a', timestamp: '2020-01-01T00:00:00Z' }],
      [{ id: 'b', timestamp: '2021-06-01T00:00:00Z' }],
      [],
      []
    );
    assert.strictEqual(m[0].id, 'b');
    assert.strictEqual(m[1].id, 'a');
  });

  it('interleaves all four types by time', () => {
    const m = mergeScanHistory(
      [{ id: 'p', timestamp: '2022-01-01T00:00:00Z' }],
      [{ id: 'au', timestamp: '2023-01-01T00:00:00Z' }],
      [{ id: 'd', timestamp: '2021-01-01T00:00:00Z' }],
      [{ id: 'pr', timestamp: '2024-01-01T00:00:00Z' }]
    );
    assert.deepStrictEqual(
      m.map(x => x.id),
      ['pr', 'au', 'p', 'd']
    );
    assert.ok(m.every(x => ['plugin', 'audio', 'daw', 'preset'].includes(x._type)));
  });

  it('empty inputs', () => {
    assert.deepStrictEqual(mergeScanHistory([], [], [], []), []);
  });
});
