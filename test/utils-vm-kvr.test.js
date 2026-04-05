/**
 * buildKvrUrl from frontend/js/utils.js — slug + optional manufacturer map.
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts, defaultDocument } = require('./frontend-vm-harness.js');

describe('frontend/js/utils.js buildKvrUrl', () => {
  let U;

  before(() => {
    U = loadFrontendScripts(['utils.js'], {
      document: defaultDocument(),
      KVR_MANUFACTURER_MAP: {
        nativeinstruments: 'native-instruments',
        xferrecords: 'xfer-records',
      },
    });
  });

  it('builds product URL without manufacturer', () => {
    assert.strictEqual(
      U.buildKvrUrl('Serum 2', 'Unknown'),
      'https://www.kvraudio.com/product/serum-2'
    );
  });

  it('maps known manufacturer slug from KVR_MANUFACTURER_MAP', () => {
    assert.strictEqual(
      U.buildKvrUrl('Massive X', 'Native Instruments'),
      'https://www.kvraudio.com/product/massive-x-by-native-instruments'
    );
  });

  it('uses slugify for unknown manufacturer', () => {
    assert.strictEqual(
      U.buildKvrUrl('Foo', 'Weird Mfg Name'),
      'https://www.kvraudio.com/product/foo-by-weird-mfg-name'
    );
  });
});
