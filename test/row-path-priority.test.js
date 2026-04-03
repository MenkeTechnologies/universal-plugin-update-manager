const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/batch-select.js getRowPath ──
function getRowPathFromDatasets(ds) {
  return ds.audioPath || ds.dawPath || ds.presetPath || ds.midiPath || null;
}

describe('getRowPathFromDatasets', () => {
  it('prefers audioPath', () => {
    assert.strictEqual(
      getRowPathFromDatasets({
        audioPath: '/a.wav',
        dawPath: '/b.als',
        presetPath: '/c.fx',
        midiPath: '/d.mid',
      }),
      '/a.wav'
    );
  });

  it('falls back to dawPath', () => {
    assert.strictEqual(
      getRowPathFromDatasets({ dawPath: '/p.als', presetPath: '/c.h2p' }),
      '/p.als'
    );
  });

  it('falls back to presetPath', () => {
    assert.strictEqual(getRowPathFromDatasets({ presetPath: '/x.h2p' }), '/x.h2p');
  });

  it('falls back to midiPath', () => {
    assert.strictEqual(getRowPathFromDatasets({ midiPath: '/m.mid' }), '/m.mid');
  });

  it('returns null when empty', () => {
    assert.strictEqual(getRowPathFromDatasets({}), null);
  });

  it('empty string is truthy-fail: first empty skips in JS', () => {
    assert.strictEqual(
      getRowPathFromDatasets({ audioPath: '', dawPath: '/ok.als' }),
      '/ok.als'
    );
  });
});
