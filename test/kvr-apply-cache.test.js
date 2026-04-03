const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/kvr.js applyKvrCache (pure merge) ──
function applyKvrCache(plugins, cache) {
  for (const p of plugins) {
    const key = `${(p.manufacturer || 'Unknown').toLowerCase()}|||${p.name.toLowerCase()}`;
    const cached = cache[key];
    if (cached) {
      p.kvrUrl = cached.kvrUrl || p.kvrUrl;
      p.source = cached.source || p.source;
      if (cached.latestVersion && cached.latestVersion !== p.version) {
        p.latestVersion = cached.latestVersion;
        p.currentVersion = p.version;
        p.hasUpdate = cached.hasUpdate || false;
      }
      if (cached.updateUrl && p.hasUpdate) {
        p.updateUrl = cached.updateUrl;
      }
    }
  }
}

describe('applyKvrCache', () => {
  it('fills kvrUrl from cache', () => {
    const p = { name: 'X', manufacturer: 'Y', kvrUrl: null };
    applyKvrCache([p], { 'y|||x': { kvrUrl: 'https://kvraudio.com/x' } });
    assert.strictEqual(p.kvrUrl, 'https://kvraudio.com/x');
  });

  it('preserves existing kvrUrl when cache omits', () => {
    const p = { name: 'X', manufacturer: 'Y', kvrUrl: 'https://old' };
    applyKvrCache([p], { 'y|||x': { source: 'kvr' } });
    assert.strictEqual(p.kvrUrl, 'https://old');
  });

  it('sets update fields when version differs', () => {
    const p = { name: 'P', manufacturer: 'M', version: '1.0', kvrUrl: null };
    applyKvrCache([p], {
      'm|||p': { latestVersion: '2.0', hasUpdate: true, updateUrl: 'https://dl' },
    });
    assert.strictEqual(p.latestVersion, '2.0');
    assert.strictEqual(p.currentVersion, '1.0');
    assert.strictEqual(p.hasUpdate, true);
    assert.strictEqual(p.updateUrl, 'https://dl');
  });

  it('skips updateUrl when no update', () => {
    const p = { name: 'P', manufacturer: 'M', version: '1.0', hasUpdate: false };
    applyKvrCache([p], {
      'm|||p': { latestVersion: '2.0', updateUrl: 'https://dl' },
    });
    assert.strictEqual(p.updateUrl, undefined);
  });
});
