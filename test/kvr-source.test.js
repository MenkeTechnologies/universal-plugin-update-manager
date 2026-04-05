/**
 * Loads real utils.js + kvr.js — KVR cache keying and applying cached rows to plugin objects.
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts } = require('./frontend-vm-harness.js');

describe('frontend/js/kvr.js (vm-loaded)', () => {
  let K;

  before(() => {
    K = loadFrontendScripts(['utils.js', 'kvr.js'], {
      KVR_MANUFACTURER_MAP: { 'u-he': 'u-he' },
    });
  });

  it('kvrCacheKey is stable lowercase name+manufacturer tuple', () => {
    assert.strictEqual(
      K.kvrCacheKey({ name: 'Diva', manufacturer: 'u-he' }),
      'u-he|||diva'
    );
    assert.strictEqual(
      K.kvrCacheKey({ name: 'X', manufacturer: 'Unknown' }),
      'unknown|||x'
    );
  });

  it('applyKvrCache merges URLs and update flags from cache map', () => {
    const plugins = [
      {
        name: 'Serum',
        manufacturer: 'Xfer Records',
        version: '1.0',
        path: '/a.vst3',
        kvrUrl: null,
        source: undefined,
        hasUpdate: false,
      },
    ];
    const cache = {
      'xfer records|||serum': {
        kvrUrl: 'https://www.kvraudio.com/product/serum',
        source: 'kvr',
        latestVersion: '2.0',
        hasUpdate: true,
        updateUrl: 'https://xfer.com/dl',
      },
    };
    K.applyKvrCache(plugins, cache);
    assert.strictEqual(plugins[0].kvrUrl, 'https://www.kvraudio.com/product/serum');
    assert.strictEqual(plugins[0].source, 'kvr');
    assert.strictEqual(plugins[0].latestVersion, '2.0');
    assert.strictEqual(plugins[0].currentVersion, '1.0');
    assert.strictEqual(plugins[0].hasUpdate, true);
    assert.strictEqual(plugins[0].updateUrl, 'https://xfer.com/dl');
  });

  it('applyKvrCache leaves plugins alone when key missing', () => {
    const plugins = [{ name: 'Only', manufacturer: 'Local', version: '1', path: '/p', kvrUrl: null }];
    K.applyKvrCache(plugins, {});
    assert.strictEqual(plugins[0].kvrUrl, null);
  });

  it('kvrCacheKey treats missing manufacturer as Unknown', () => {
    assert.strictEqual(
      K.kvrCacheKey({ name: 'NoMfg', manufacturer: null }),
      'unknown|||nomfg'
    );
  });

  it('applyKvrCache merges kvrUrl without touching version fields when latestVersion matches version', () => {
    const plugins = [
      {
        name: 'Stable',
        manufacturer: 'Co',
        version: '2.0',
        path: '/s',
        kvrUrl: null,
        hasUpdate: false,
      },
    ];
    const cache = {
      'co|||stable': {
        kvrUrl: 'https://kvraudio.com/stable',
        source: 'kvr',
        latestVersion: '2.0',
        hasUpdate: true,
      },
    };
    K.applyKvrCache(plugins, cache);
    assert.strictEqual(plugins[0].kvrUrl, 'https://kvraudio.com/stable');
    assert.strictEqual(plugins[0].source, 'kvr');
    assert.strictEqual(plugins[0].latestVersion, undefined);
    assert.strictEqual(plugins[0].hasUpdate, false);
  });

  it('applyKvrCache does not set updateUrl when hasUpdate is false even if cache has updateUrl', () => {
    const plugins = [
      {
        name: 'P',
        manufacturer: 'M',
        version: '1',
        path: '/p',
        kvrUrl: null,
        hasUpdate: false,
      },
    ];
    const cache = {
      'm|||p': {
        kvrUrl: 'https://kvr/p',
        latestVersion: '9',
        hasUpdate: false,
        updateUrl: 'https://dl',
      },
    };
    K.applyKvrCache(plugins, cache);
    assert.strictEqual(plugins[0].latestVersion, '9');
    assert.strictEqual(plugins[0].hasUpdate, false);
    assert.strictEqual(plugins[0].updateUrl, undefined);
  });
});
