/**
 * Loads real utils.js + favorites.js; exercises prefs-backed favorite add/remove/dedup flows.
 */
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts } = require('./frontend-vm-harness.js');

function loadFavoritesSandbox() {
  const toasts = [];
  return loadFrontendScripts(['utils.js', 'favorites.js'], {
    prefs: {
      _cache: {},
      getObject(key, fallback) {
        const v = this._cache[key];
        if (v === undefined || v === null) return fallback;
        return v;
      },
      setItem(key, value) {
        this._cache[key] = value;
      },
      removeItem(key) {
        delete this._cache[key];
      },
    },
    showToast: (msg) => {
      toasts.push(msg);
    },
    toastFmt: (key, vars) => (vars ? `${key}:${JSON.stringify(vars)}` : key),
    appFmt: (key) => key,
    exportFileName: (label) => `audiohaxor-${label}-ts`,
    refreshRowBadges: () => {},
    /** Captured for assertions */
    _toasts: toasts,
  });
}

describe('frontend/js/favorites.js (vm-loaded)', () => {
  let S;

  beforeEach(() => {
    S = loadFavoritesSandbox();
  });

  it('getFavorites starts empty', () => {
    const favs = S.getFavorites();
    assert.ok(Array.isArray(favs));
    assert.strictEqual(favs.length, 0);
  });

  it('addFavorite prepends entry and persists via prefs', () => {
    S.addFavorite('sample', '/audio/kick.wav', 'Kick', { format: 'WAV' });
    const favs = S.getFavorites();
    assert.strictEqual(favs.length, 1);
    assert.strictEqual(favs[0].path, '/audio/kick.wav');
    assert.strictEqual(favs[0].type, 'sample');
    assert.strictEqual(favs[0].format, 'WAV');
    assert.ok(favs[0].addedAt);
  });

  it('isFavorite reflects stored paths', () => {
    S.addFavorite('plugin', '/p/Serum.vst3', 'Serum', {});
    assert.strictEqual(S.isFavorite('/p/Serum.vst3'), true);
    assert.strictEqual(S.isFavorite('/other'), false);
  });

  it('addFavorite second time with same path does not duplicate (toasts twice: add + duplicate)', () => {
    S.addFavorite('daw', '/proj/a.als', 'A', { daw: 'Ableton Live' });
    const n1 = S.getFavorites().length;
    S.addFavorite('daw', '/proj/a.als', 'A', { daw: 'Ableton Live' });
    assert.strictEqual(S.getFavorites().length, n1);
    assert.ok(S._toasts.some((t) => String(t).includes('toast.already_in_favorites')));
  });

  it('removeFavorite drops path and leaves others', () => {
    S.addFavorite('sample', '/a.wav', 'A', {});
    S.addFavorite('sample', '/b.wav', 'B', {});
    S.removeFavorite('/a.wav');
    assert.strictEqual(S.getFavorites().length, 1);
    assert.strictEqual(S.getFavorites()[0].path, '/b.wav');
  });
});
