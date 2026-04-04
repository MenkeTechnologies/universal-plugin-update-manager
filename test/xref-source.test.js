/**
 * Loads real utils.js + xref.js; validates xref format gate used before Rust extraction.
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts } = require('./frontend-vm-harness.js');

describe('frontend/js/xref.js (vm-loaded)', () => {
  let X;

  before(() => {
    X = loadFrontendScripts(['utils.js', 'xref.js']);
  });

  it('isXrefSupported accepts all DAW formats wired for extraction', () => {
    const supported = [
      'ALS',
      'RPP',
      'RPP-BAK',
      'BWPROJECT',
      'SONG',
      'DAWPROJECT',
      'FLP',
      'LOGICX',
      'CPR',
      'NPR',
      'PTX',
      'PTF',
      'REASON',
    ];
    for (const fmt of supported) {
      assert.strictEqual(
        X.isXrefSupported(fmt),
        true,
        `expected ${fmt} supported`
      );
    }
  });

  it('isXrefSupported rejects non-project formats', () => {
    assert.strictEqual(X.isXrefSupported('WAV'), false);
    assert.strictEqual(X.isXrefSupported('MP3'), false);
    assert.strictEqual(X.isXrefSupported(''), false);
  });

  it('isXrefSupported is case-sensitive (matches Set keys from project format field)', () => {
    assert.strictEqual(X.isXrefSupported('als'), false);
    assert.strictEqual(X.isXrefSupported('ALS'), true);
  });
});
