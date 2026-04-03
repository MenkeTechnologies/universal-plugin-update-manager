const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Mirror daw_scanner::daw_name_for_format (subset for UI)
function dawNameForFormat(fmt) {
  const u = fmt.toUpperCase();
  const m = {
    ALS: 'Ableton Live',
    LOGICX: 'Logic Pro',
    FLP: 'FL Studio',
    CPR: 'Cubase',
    RPP: 'REAPER',
    PTX: 'Pro Tools',
    BWPROJECT: 'Bitwig Studio',
    SONG: 'Studio One',
    REASON: 'Reason',
  };
  return m[u] || 'Unknown';
}

describe('dawNameForFormat', () => {
  it('known', () => {
    assert.strictEqual(dawNameForFormat('als'), 'Ableton Live');
    assert.strictEqual(dawNameForFormat('LOGICX'), 'Logic Pro');
  });

  it('unknown', () => {
    assert.strictEqual(dawNameForFormat('XYZ'), 'Unknown');
  });
});
