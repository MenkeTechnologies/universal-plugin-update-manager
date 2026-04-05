const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiToName(n, octaveOffset = 0) {
  const name = NAMES[((n % 12) + 12) % 12];
  const oct = Math.floor(n / 12) - 1 + octaveOffset;
  return name + oct;
}

describe('midiToName', () => {
  it('middle C', () => assert.strictEqual(midiToName(60), 'C4'));

  it('chromatic one octave starting at C4', () => {
    const expected = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
    for (let i = 0; i < 12; i++) {
      assert.strictEqual(midiToName(60 + i), expected[i]);
    }
  });

  it('negative MIDI note wraps pitch class', () => {
    assert.strictEqual(midiToName(-1), 'B-2');
    assert.strictEqual(midiToName(-12), 'C-2');
  });

  it('octave offset shifts label', () => {
    assert.strictEqual(midiToName(60, 1), 'C5');
    assert.strictEqual(midiToName(60, -1), 'C3');
  });

  it('A440', () => assert.strictEqual(midiToName(69), 'A4'));

  it('lowest common MIDI 0', () => assert.strictEqual(midiToName(0), 'C-1'));
});
