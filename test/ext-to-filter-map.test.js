const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/utils.js EXT_TO_FILTER ──
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

describe('EXT_TO_FILTER', () => {
  it('maps common audio extensions', () => {
    assert.strictEqual(EXT_TO_FILTER.wav, 'WAV');
    assert.strictEqual(EXT_TO_FILTER.flac, 'FLAC');
    assert.strictEqual(EXT_TO_FILTER.opus, undefined);
  });

  it('maps plugin types', () => {
    assert.strictEqual(EXT_TO_FILTER.vst3, 'VST3');
    assert.strictEqual(EXT_TO_FILTER.component, 'Audio Units');
  });

  it('maps DAW file extensions to product names', () => {
    assert.strictEqual(EXT_TO_FILTER.als, 'Ableton Live');
    assert.strictEqual(EXT_TO_FILTER.logicx, 'Logic Pro');
    assert.strictEqual(EXT_TO_FILTER.cpr, 'Cubase');
    assert.strictEqual(EXT_TO_FILTER.ptx, 'Pro Tools');
    assert.strictEqual(EXT_TO_FILTER.bwproject, 'Bitwig Studio');
    assert.strictEqual(EXT_TO_FILTER.song, 'Studio One');
  });

  it('aliases resolve to same filter value where expected', () => {
    assert.strictEqual(EXT_TO_FILTER.alp, EXT_TO_FILTER.als);
    assert.strictEqual(EXT_TO_FILTER.logic, EXT_TO_FILTER.logicx);
    assert.strictEqual(EXT_TO_FILTER.fl, EXT_TO_FILTER.flp);
    assert.strictEqual(EXT_TO_FILTER.cubase, EXT_TO_FILTER.cpr);
    assert.strictEqual(EXT_TO_FILTER.reaper, EXT_TO_FILTER.rpp);
    assert.strictEqual(EXT_TO_FILTER.protools, EXT_TO_FILTER.ptx);
    assert.strictEqual(EXT_TO_FILTER.bitwig, EXT_TO_FILTER.bwproject);
    assert.strictEqual(EXT_TO_FILTER.studioone, EXT_TO_FILTER.song);
  });

  it('audacity and garageband variants', () => {
    assert.strictEqual(EXT_TO_FILTER.aup3, 'Audacity');
    assert.strictEqual(EXT_TO_FILTER.band, 'GarageBand');
    assert.strictEqual(EXT_TO_FILTER.garageband, 'GarageBand');
  });

  it('open standards', () => {
    assert.strictEqual(EXT_TO_FILTER.dawproject, 'DAWproject');
    assert.strictEqual(EXT_TO_FILTER.ardour, 'Ardour');
  });
});
