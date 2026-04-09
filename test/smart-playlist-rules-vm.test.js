/**
 * Rule engine from frontend/js/smart-playlists.js — vm-loaded with stubs.
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts, defaultDocument } = require('./frontend-vm-harness.js');

describe('frontend/js/smart-playlists.js matchesSmartRule / evaluateSmartPlaylist', () => {
  let U;

  before(() => {
    U = loadFrontendScripts(['utils.js', 'smart-playlists.js'], {
      document: defaultDocument(),
      prefs: {
        getObject: () => [],
        setItem: () => {},
        getItem: () => null,
      },
      allAudioSamples: [
        { path: '/k.wav', name: 'Kick.wav', format: 'WAV', sizeBytes: 2 * 1024 * 1024, duration: 30 },
        { path: '/loops/hihat.aiff', name: 'HiHat', format: 'AIFF', sizeBytes: 400 * 1024, duration: 400 },
        { path: '/big.wav', name: 'Big', format: 'WAV', sizeBytes: 20 * 1024 * 1024, duration: 12 },
      ],
      _bpmCache: {
        '/k.wav': 118,
        '/loops/hihat.aiff': 140,
        '/big.wav': 90,
      },
      _keyCache: {
        '/k.wav': 'C minor',
        '/loops/hihat.aiff': 'F#',
      },
      getNote: (p) => (p === '/k.wav' ? { tags: ['drums', 'kick'] } : null),
      isFavorite: (p) => p === '/loops/hihat.aiff',
      recentlyPlayed: [{ path: '/k.wav', name: 'Kick.wav' }],
    });
  });

  it('format: comma-separated list is case-insensitive', () => {
    const s = U.allAudioSamples[0];
    assert.strictEqual(U.matchesSmartRule(s, { type: 'format', value: 'wav, flac' }), true);
    assert.strictEqual(U.matchesSmartRule(s, { type: 'format', value: 'MP3' }), false);
  });

  it('bpm_range: inclusive bounds use cached BPM', () => {
    const s = U.allAudioSamples[0];
    assert.strictEqual(U.matchesSmartRule(s, { type: 'bpm_range', value: '100-120' }), true);
    assert.strictEqual(U.matchesSmartRule(s, { type: 'bpm_range', value: '130-200' }), false);
  });

  it('bpm_range: reversed endpoints and spaces are accepted; malformed range rejects', () => {
    const s = U.allAudioSamples[0];
    assert.strictEqual(U.matchesSmartRule(s, { type: 'bpm_range', value: '120-100' }), true);
    assert.strictEqual(U.matchesSmartRule(s, { type: 'bpm_range', value: '100 - 120' }), true);
    assert.strictEqual(U.matchesSmartRule(s, { type: 'bpm_range', value: '10-20-30' }), false);
  });

  it('bpm_range: no cache misses', () => {
    const s = { path: '/none.wav', name: 'x', format: 'WAV', sizeBytes: 100 };
    assert.strictEqual(U.matchesSmartRule(s, { type: 'bpm_range', value: '0-999' }), false);
  });

  it('name_contains and path_contains', () => {
    const k = U.allAudioSamples[0];
    assert.strictEqual(U.matchesSmartRule(k, { type: 'name_contains', value: 'kick' }), true);
    assert.strictEqual(U.matchesSmartRule(k, { type: 'path_contains', value: '/loops' }), false);
    const h = U.allAudioSamples[1];
    assert.strictEqual(U.matchesSmartRule(h, { type: 'path_contains', value: 'LOOPS' }), true);
  });

  it('size_max and size_min (MB)', () => {
    const k = U.allAudioSamples[0];
    assert.strictEqual(U.matchesSmartRule(k, { type: 'size_max', value: '5' }), true);
    assert.strictEqual(U.matchesSmartRule(k, { type: 'size_max', value: '1' }), false);
    assert.strictEqual(U.matchesSmartRule(k, { type: 'size_min', value: '1' }), true);
    const big = U.allAudioSamples[2];
    assert.strictEqual(U.matchesSmartRule(big, { type: 'size_min', value: '15' }), true);
  });

  it('key: substring on cached key', () => {
    const k = U.allAudioSamples[0];
    assert.strictEqual(U.matchesSmartRule(k, { type: 'key', value: 'minor' }), true);
    assert.strictEqual(U.matchesSmartRule(k, { type: 'key', value: 'major' }), false);
  });

  it('tag: uses getNote', () => {
    const k = U.allAudioSamples[0];
    assert.strictEqual(U.matchesSmartRule(k, { type: 'tag', value: 'drums' }), true);
    assert.strictEqual(U.matchesSmartRule(k, { type: 'tag', value: 'missing' }), false);
  });

  it('favorite and recently_played', () => {
    const fav = U.allAudioSamples[1];
    const notFav = U.allAudioSamples[0];
    assert.strictEqual(U.matchesSmartRule(fav, { type: 'favorite', value: '' }), true);
    assert.strictEqual(U.matchesSmartRule(notFav, { type: 'favorite', value: '' }), false);
    assert.strictEqual(U.matchesSmartRule(notFav, { type: 'recently_played', value: '' }), true);
  });

  it('evaluateSmartPlaylist: matchMode all vs any', () => {
    const onlyWav = U.evaluateSmartPlaylist({
      rules: [{ type: 'format', value: 'WAV' }],
      matchMode: 'all',
    });
    assert.ok(onlyWav.every((s) => s.format === 'WAV'));
    const anyRule = U.evaluateSmartPlaylist({
      rules: [{ type: 'format', value: 'FLAC' }, { type: 'format', value: 'WAV' }],
      matchMode: 'any',
    });
    assert.ok(anyRule.length >= 1);
  });

  it('evaluateSmartPlaylist: empty rules yields no rows', () => {
    assert.strictEqual(
      U.evaluateSmartPlaylist({ rules: [], matchMode: 'all' }).length,
      0
    );
  });

  it('duration_max: seconds, requires sample.duration', () => {
    const short = U.allAudioSamples[0];
    assert.strictEqual(U.matchesSmartRule(short, { type: 'duration_max', value: '60' }), true);
    assert.strictEqual(U.matchesSmartRule(short, { type: 'duration_max', value: '10' }), false);
    assert.strictEqual(
      U.matchesSmartRule({ path: '/x.wav', name: 'x', format: 'WAV', sizeBytes: 1 }, { type: 'duration_max', value: '60' }),
      false
    );
  });

  it('unknown rule type does not match', () => {
    assert.strictEqual(
      U.matchesSmartRule(U.allAudioSamples[0], { type: 'not_a_real_type', value: '' }),
      false
    );
  });
});
