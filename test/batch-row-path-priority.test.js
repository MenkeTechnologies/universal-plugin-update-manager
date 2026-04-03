const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/batch-select.js getRowPath ──
function getRowPath(tr) {
  if (!tr) return null;
  return tr.dataset.audioPath || tr.dataset.dawPath || tr.dataset.presetPath || tr.dataset.midiPath || null;
}

describe('getRowPath', () => {
  it('prefers audio over others', () => {
    const tr = {
      dataset: {
        audioPath: '/a.wav',
        dawPath: '/p.als',
        presetPath: '/x.fxp',
        midiPath: '/m.mid',
      },
    };
    assert.strictEqual(getRowPath(tr), '/a.wav');
  });

  it('falls through when audio missing', () => {
    const tr = { dataset: { dawPath: '/p.als', presetPath: '/x.fxp' } };
    assert.strictEqual(getRowPath(tr), '/p.als');
  });

  it('midi when only midi set', () => {
    const tr = { dataset: { midiPath: '/m.mid' } };
    assert.strictEqual(getRowPath(tr), '/m.mid');
  });

  it('null when empty dataset', () => {
    assert.strictEqual(getRowPath({ dataset: {} }), null);
  });

  it('null when no tr', () => {
    assert.strictEqual(getRowPath(null), null);
  });
});
