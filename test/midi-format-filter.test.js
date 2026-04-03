const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/midi.js loadMidiFiles filter ──
const MIDI_FORMATS = new Set(['MID', 'MIDI']);

function filterMidiPresets(presets) {
  return presets.filter(p => MIDI_FORMATS.has(p.format));
}

describe('filterMidiPresets', () => {
  it('keeps MID and MIDI', () => {
    const rows = [
      { name: 'a', format: 'MID' },
      { name: 'b', format: 'MIDI' },
      { name: 'c', format: 'FXP' },
    ];
    assert.strictEqual(filterMidiPresets(rows).length, 2);
  });

  it('empty input', () => {
    assert.deepStrictEqual(filterMidiPresets([]), []);
  });

  it('case sensitive on format', () => {
    const rows = [{ name: 'x', format: 'mid' }];
    assert.strictEqual(filterMidiPresets(rows).length, 0);
  });
});
