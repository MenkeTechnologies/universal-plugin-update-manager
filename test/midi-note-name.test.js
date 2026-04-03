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
});
