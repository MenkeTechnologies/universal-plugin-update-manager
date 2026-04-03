const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Mirrors frontend/js/xref.js and midi tab ──
const XREF_FORMATS = new Set(['ALS', 'RPP', 'RPP-BAK', 'BWPROJECT', 'SONG', 'DAWPROJECT', 'FLP', 'LOGICX', 'CPR', 'NPR', 'PTX', 'PTF', 'REASON']);

function isXrefSupported(format) {
  return XREF_FORMATS.has(format);
}

const MIDI_FORMATS = new Set(['MID', 'MIDI']);

// ── EXT_TO_FILTER from frontend/js/utils.js (extension keyword → filter value) ──
const EXT_TO_FILTER = {
  wav: 'WAV',
  mp3: 'MP3',
  aiff: 'AIFF',
  aif: 'AIF',
  flac: 'FLAC',
  ogg: 'OGG',
  m4a: 'M4A',
  aac: 'AAC',
  vst2: 'VST2',
  vst3: 'VST3',
  au: 'Audio Units',
  component: 'Audio Units',
  als: 'Ableton Live',
  alp: 'Ableton Live',
  ableton: 'Ableton Live',
  logicx: 'Logic Pro',
  logic: 'Logic Pro',
  flp: 'FL Studio',
  fl: 'FL Studio',
  cpr: 'Cubase',
  cubase: 'Cubase',
  rpp: 'REAPER',
  reaper: 'REAPER',
  ptx: 'Pro Tools',
  ptf: 'Pro Tools',
  protools: 'Pro Tools',
  bwproject: 'Bitwig Studio',
  bitwig: 'Bitwig Studio',
  song: 'Studio One',
  studioone: 'Studio One',
  reason: 'Reason',
  aup: 'Audacity',
  aup3: 'Audacity',
  audacity: 'Audacity',
  band: 'GarageBand',
  garageband: 'GarageBand',
  ardour: 'Ardour',
  dawproject: 'DAWproject',
};

describe('XREF_FORMATS / isXrefSupported', () => {
  it('includes common DAW project extensions', () => {
    assert.ok(isXrefSupported('ALS'));
    assert.ok(isXrefSupported('RPP'));
    assert.ok(isXrefSupported('DAWPROJECT'));
    assert.ok(isXrefSupported('LOGICX'));
  });

  it('includes RPP-BAK variant', () => {
    assert.ok(isXrefSupported('RPP-BAK'));
  });

  it('rejects random strings', () => {
    assert.ok(!isXrefSupported('WAV'));
    assert.ok(!isXrefSupported('MP3'));
    assert.ok(!isXrefSupported(''));
  });

  it('set size is stable', () => {
    assert.strictEqual(XREF_FORMATS.size, 13);
  });
});

describe('MIDI_FORMATS', () => {
  it('recognizes MID and MIDI', () => {
    assert.ok(MIDI_FORMATS.has('MID'));
    assert.ok(MIDI_FORMATS.has('MIDI'));
  });

  it('does not include lowercase', () => {
    assert.ok(!MIDI_FORMATS.has('mid'));
  });
});

describe('EXT_TO_FILTER', () => {
  it('maps audio extensions', () => {
    assert.strictEqual(EXT_TO_FILTER.wav, 'WAV');
    assert.strictEqual(EXT_TO_FILTER.flac, 'FLAC');
    assert.strictEqual(EXT_TO_FILTER.m4a, 'M4A');
  });

  it('maps plugin keywords', () => {
    assert.strictEqual(EXT_TO_FILTER.vst3, 'VST3');
    assert.strictEqual(EXT_TO_FILTER.au, 'Audio Units');
    assert.strictEqual(EXT_TO_FILTER.component, 'Audio Units');
  });

  it('maps DAW aliases', () => {
    assert.strictEqual(EXT_TO_FILTER.als, 'Ableton Live');
    assert.strictEqual(EXT_TO_FILTER.alp, 'Ableton Live');
    assert.strictEqual(EXT_TO_FILTER.bwproject, 'Bitwig Studio');
  });

  it('every value is non-empty string', () => {
    for (const [k, v] of Object.entries(EXT_TO_FILTER)) {
      assert.ok(typeof v === 'string' && v.length > 0, k);
    }
  });
});
