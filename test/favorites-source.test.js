/**
 * Loads real utils.js + notes.js + favorites.js; exercises SQLite-backed favorite add/remove/dedup flows.
 */
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts } = require('./frontend-vm-harness.js');

function loadFavoritesSandbox() {
  const toasts = [];
  // In-memory store backing the vstUpdater mock (mirrors SQLite)
  const favStore = [];
  return loadFrontendScripts(['utils.js', 'notes.js', 'favorites.js'], {
    CSS: { escape: (v) => v },
    showToast: (msg) => {
      toasts.push(msg);
    },
    toastFmt: (key, vars) => (vars ? `${key}:${JSON.stringify(vars)}` : key),
    appFmt: (key) => key,
    catalogFmt: (key) => key,
    exportFileName: (label) => `audiohaxor-${label}-ts`,
    refreshRowBadges: () => {},
    renderFavorites: () => {},
    vstUpdater: {
      async favoritesList() { return favStore.slice(); },
      async favoritesAdd(type, path, name, format, daw, addedAt) {
        if (favStore.some(f => f.path === path)) return false;
        favStore.push({ type, path, name, format, daw, addedAt });
        return true;
      },
      async favoritesRemove(path) {
        const idx = favStore.findIndex(f => f.path === path);
        if (idx !== -1) favStore.splice(idx, 1);
      },
      async notesGetAll() { return {}; },
      async tagsStandaloneList() { return []; },
    },
    /** Captured for assertions */
    _toasts: toasts,
  });
}

describe('frontend/js/favorites.js (vm-loaded)', () => {
  let S;

  beforeEach(() => {
    S = loadFavoritesSandbox();
  });

  it('getFavorites starts empty', async () => {
    const favs = await S.getFavorites();
    assert.ok(Array.isArray(favs));
    assert.strictEqual(favs.length, 0);
  });

  it('addFavorite prepends entry and persists via vstUpdater', async () => {
    await S.addFavorite('sample', '/audio/kick.wav', 'Kick', { format: 'WAV' });
    const favs = await S.getFavorites();
    assert.strictEqual(favs.length, 1);
    assert.strictEqual(favs[0].path, '/audio/kick.wav');
    assert.strictEqual(favs[0].type, 'sample');
    assert.strictEqual(favs[0].format, 'WAV');
    assert.ok(favs[0].addedAt);
  });

  it('isFavorite reflects stored paths', async () => {
    await S.addFavorite('plugin', '/p/Serum.vst3', 'Serum', {});
    assert.strictEqual(S.isFavorite('/p/Serum.vst3'), true);
    assert.strictEqual(S.isFavorite('/other'), false);
  });

  it('addFavorite second time with same path does not duplicate (toasts twice: add + duplicate)', async () => {
    await S.addFavorite('daw', '/proj/a.als', 'A', { daw: 'Ableton Live' });
    const n1 = (await S.getFavorites()).length;
    await S.addFavorite('daw', '/proj/a.als', 'A', { daw: 'Ableton Live' });
    assert.strictEqual((await S.getFavorites()).length, n1);
    assert.ok(S._toasts.some((t) => String(t).includes('toast.already_in_favorites')));
  });

  it('removeFavorite drops path and leaves others', async () => {
    await S.addFavorite('sample', '/a.wav', 'A', {});
    await S.addFavorite('sample', '/b.wav', 'B', {});
    await S.removeFavorite('/a.wav');
    assert.strictEqual((await S.getFavorites()).length, 1);
    assert.strictEqual((await S.getFavorites())[0].path, '/b.wav');
  });

  it('exportFavorites with empty list only toasts and does not require showExportModal', async () => {
    await S.exportFavorites();
    assert.ok(S._toasts.some((t) => String(t).includes('toast.no_favorites_export')));
  });
});
