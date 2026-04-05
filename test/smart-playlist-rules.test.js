const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Replicated from frontend/js/smart-playlists.js (matchesSmartRule + evaluate) ──
function matchesSmartRule(sample, rule, ctx = {}) {
  const bpmCache = ctx.bpmCache || {};
  const keyCache = ctx.keyCache || {};
  const getNote = ctx.getNote;
  const isFavorite = ctx.isFavorite;
  const recentlyPlayed = ctx.recentlyPlayed;

  switch (rule.type) {
    case 'format': {
      const formats = (rule.value || '').split(',').map(f => f.trim().toUpperCase()).filter(Boolean);
      return formats.includes(sample.format);
    }
    case 'bpm_range': {
      const bpm = bpmCache[sample.path];
      if (bpm == null) return false;
      const [min, max] = (rule.value || '0-999').split('-').map(Number);
      return bpm >= min && bpm <= max;
    }
    case 'tag': {
      if (typeof getNote !== 'function') return false;
      const note = getNote(sample.path);
      return note && note.tags && note.tags.includes(rule.value);
    }
    case 'favorite': {
      return typeof isFavorite === 'function' && isFavorite(sample.path);
    }
    case 'recently_played': {
      return Array.isArray(recentlyPlayed) && recentlyPlayed.some(r => r.path === sample.path);
    }
    case 'name_contains': {
      return sample.name.toLowerCase().includes((rule.value || '').toLowerCase());
    }
    case 'path_contains': {
      return sample.path.toLowerCase().includes((rule.value || '').toLowerCase());
    }
    case 'size_max': {
      const maxBytes = parseFloat(rule.value || '0') * 1024 * 1024;
      return sample.sizeBytes <= maxBytes;
    }
    case 'size_min': {
      const minBytes = parseFloat(rule.value || '0') * 1024 * 1024;
      return sample.sizeBytes >= minBytes;
    }
    case 'key': {
      const key = keyCache[sample.path];
      if (!key) return false;
      return key.toLowerCase().includes((rule.value || '').toLowerCase());
    }
    case 'duration_max': {
      const maxSec = parseFloat(rule.value || '0');
      if (!(maxSec > 0) || !Number.isFinite(maxSec)) return false;
      const dur = sample.duration;
      if (dur == null || !Number.isFinite(dur) || dur <= 0) return false;
      return dur <= maxSec;
    }
    default:
      return false;
  }
}

function evaluateSmartPlaylist(playlist, samples, ctx = {}) {
  const rules = playlist.rules || [];
  if (rules.length === 0) return [];
  const matchMode = playlist.matchMode || 'all';
  return samples.filter(sample => {
    if (matchMode === 'any') return rules.some(r => matchesSmartRule(sample, r, ctx));
    return rules.every(r => matchesSmartRule(sample, r, ctx));
  });
}

const S1 = { name: 'Kick', path: '/a/kick.wav', format: 'WAV', sizeBytes: 1 * 1024 * 1024 };
const S2 = { name: 'Snare Room', path: '/b/snare.wav', format: 'WAV', sizeBytes: 3 * 1024 * 1024 };
const S3 = { name: 'Vocal', path: '/c/v.mp3', format: 'MP3', sizeBytes: 0.5 * 1024 * 1024 };

describe('matchesSmartRule format', () => {
  it('matches single format', () => {
    assert.strictEqual(matchesSmartRule(S1, { type: 'format', value: 'WAV' }), true);
    assert.strictEqual(matchesSmartRule(S3, { type: 'format', value: 'WAV' }), false);
  });

  it('matches comma-separated formats', () => {
    assert.strictEqual(matchesSmartRule(S3, { type: 'format', value: 'wav, mp3' }), true);
    assert.strictEqual(matchesSmartRule(S3, { type: 'format', value: 'FLAC, AIFF' }), false);
  });

  it('trims whitespace in list', () => {
    assert.strictEqual(matchesSmartRule(S1, { type: 'format', value: ' WAV , MP3 ' }), true);
  });

  it('is case insensitive on format list', () => {
    assert.strictEqual(matchesSmartRule(S1, { type: 'format', value: 'wav' }), true);
  });
});

describe('matchesSmartRule name_contains / path_contains', () => {
  it('name_contains substring', () => {
    assert.strictEqual(matchesSmartRule(S2, { type: 'name_contains', value: 'room' }), true);
    assert.strictEqual(matchesSmartRule(S2, { type: 'name_contains', value: 'KICK' }), false);
  });

  it('path_contains', () => {
    assert.strictEqual(matchesSmartRule(S1, { type: 'path_contains', value: '/a/' }), true);
    assert.strictEqual(matchesSmartRule(S1, { type: 'path_contains', value: '/z/' }), false);
  });

  it('empty value matches everything', () => {
    assert.strictEqual(matchesSmartRule(S1, { type: 'name_contains', value: '' }), true);
  });
});

describe('matchesSmartRule size_min / size_max', () => {
  it('size_max in MB', () => {
    assert.strictEqual(matchesSmartRule(S1, { type: 'size_max', value: '2' }), true);
    assert.strictEqual(matchesSmartRule(S2, { type: 'size_max', value: '2' }), false);
  });

  it('size_min in MB', () => {
    assert.strictEqual(matchesSmartRule(S2, { type: 'size_min', value: '2' }), true);
    assert.strictEqual(matchesSmartRule(S1, { type: 'size_min', value: '2' }), false);
  });
});

describe('matchesSmartRule bpm_range', () => {
  it('uses ctx.bpmCache', () => {
    const ctx = { bpmCache: { '/a/kick.wav': 120 } };
    assert.strictEqual(matchesSmartRule(S1, { type: 'bpm_range', value: '100-140' }, ctx), true);
    assert.strictEqual(matchesSmartRule(S1, { type: 'bpm_range', value: '130-200' }, ctx), false);
  });

  it('false when no bpm in cache', () => {
    assert.strictEqual(matchesSmartRule(S1, { type: 'bpm_range', value: '0-999' }, {}), false);
  });
});

describe('matchesSmartRule key', () => {
  it('uses ctx.keyCache', () => {
    const ctx = { keyCache: { '/c/v.mp3': 'C minor' } };
    assert.strictEqual(matchesSmartRule(S3, { type: 'key', value: 'minor' }, ctx), true);
    assert.strictEqual(matchesSmartRule(S3, { type: 'key', value: 'D' }, ctx), false);
  });
});

describe('matchesSmartRule tag / favorite / recently_played', () => {
  it('tag with getNote', () => {
    const ctx = {
      getNote: (p) => (p === '/a/kick.wav' ? { tags: ['drums', 'kick'] } : null),
    };
    assert.strictEqual(matchesSmartRule(S1, { type: 'tag', value: 'drums' }, ctx), true);
    assert.strictEqual(matchesSmartRule(S1, { type: 'tag', value: 'vocal' }, ctx), false);
  });

  it('tag without getNote is false', () => {
    assert.strictEqual(matchesSmartRule(S1, { type: 'tag', value: 'x' }), false);
  });

  it('favorite', () => {
    const ctx = { isFavorite: p => p === '/b/snare.wav' };
    assert.strictEqual(matchesSmartRule(S2, { type: 'favorite', value: '' }, ctx), true);
    assert.strictEqual(matchesSmartRule(S1, { type: 'favorite', value: '' }, ctx), false);
  });

  it('recently_played', () => {
    const ctx = { recentlyPlayed: [{ path: '/c/v.mp3' }] };
    assert.strictEqual(matchesSmartRule(S3, { type: 'recently_played', value: '' }, ctx), true);
    assert.strictEqual(matchesSmartRule(S1, { type: 'recently_played', value: '' }, ctx), false);
  });
});

describe('matchesSmartRule default', () => {
  it('unknown rule type returns false', () => {
    assert.strictEqual(matchesSmartRule(S1, { type: 'future_rule', value: 'x' }), false);
  });
});

describe('matchesSmartRule duration_max', () => {
  it('matches when duration is within max (seconds)', () => {
    assert.strictEqual(
      matchesSmartRule({ ...S1, duration: 45 }, { type: 'duration_max', value: '60' }),
      true
    );
    assert.strictEqual(
      matchesSmartRule({ ...S1, duration: 90 }, { type: 'duration_max', value: '60' }),
      false
    );
  });

  it('false when duration unknown or invalid max', () => {
    assert.strictEqual(matchesSmartRule(S1, { type: 'duration_max', value: '60' }), false);
    assert.strictEqual(matchesSmartRule({ ...S1, duration: 10 }, { type: 'duration_max', value: '' }), false);
    assert.strictEqual(matchesSmartRule({ ...S1, duration: 10 }, { type: 'duration_max', value: '0' }), false);
  });
});

describe('evaluateSmartPlaylist', () => {
  const samples = [S1, S2, S3];

  it('empty rules yields empty', () => {
    assert.deepStrictEqual(evaluateSmartPlaylist({ rules: [] }, samples), []);
  });

  it('matchMode all requires every rule', () => {
    const pl = { rules: [
      { type: 'format', value: 'WAV' },
      { type: 'name_contains', value: 'Kick' },
    ], matchMode: 'all' };
    assert.strictEqual(evaluateSmartPlaylist(pl, samples).length, 1);
    assert.strictEqual(evaluateSmartPlaylist(pl, samples)[0].name, 'Kick');
  });

  it('matchMode any matches if one rule passes', () => {
    const pl = {
      rules: [
        { type: 'name_contains', value: 'ZZZ' },
        { type: 'format', value: 'MP3' },
      ],
      matchMode: 'any',
    };
    const r = evaluateSmartPlaylist(pl, samples);
    assert.strictEqual(r.length, 1);
    assert.strictEqual(r[0].format, 'MP3');
  });

  it('defaults to matchMode all', () => {
    const pl = { rules: [{ type: 'format', value: 'WAV' }, { type: 'size_min', value: '2' }] };
    const r = evaluateSmartPlaylist(pl, samples);
    assert.strictEqual(r.length, 1);
    assert.strictEqual(r[0].name, 'Snare Room');
  });
});
