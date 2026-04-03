const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/kvr.js kvrCacheKey ──
function kvrCacheKey(plugin) {
  return `${(plugin.manufacturer || 'Unknown').toLowerCase()}|||${plugin.name.toLowerCase()}`;
}

describe('kvrCacheKey', () => {
  it('normalizes case', () => {
    assert.strictEqual(
      kvrCacheKey({ name: 'Serum', manufacturer: 'Xfer' }),
      'xfer|||serum'
    );
  });

  it('unknown manufacturer token', () => {
    assert.strictEqual(
      kvrCacheKey({ name: 'A', manufacturer: null }),
      'unknown|||a'
    );
    assert.strictEqual(
      kvrCacheKey({ name: 'A', manufacturer: 'Unknown' }),
      'unknown|||a'
    );
  });

  it('stable delimiter', () => {
    const k = kvrCacheKey({ name: 'a|||b', manufacturer: 'c|||d' });
    assert.ok(k.includes('|||'));
    assert.strictEqual(k, 'c|||d|||a|||b');
  });

  it('empty name still produces key', () => {
    assert.strictEqual(kvrCacheKey({ name: '', manufacturer: 'X' }), 'x|||');
  });
});
