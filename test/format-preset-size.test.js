const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/presets.js formatPresetSize ──
function formatPresetSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
}

describe('formatPresetSize', () => {
  it('zero', () => {
    assert.strictEqual(formatPresetSize(0), '0 B');
  });

  it('bytes through TB', () => {
    assert.strictEqual(formatPresetSize(500), '500.0 B');
    assert.strictEqual(formatPresetSize(1024), '1.0 KB');
    assert.strictEqual(formatPresetSize(1048576), '1.0 MB');
    assert.strictEqual(formatPresetSize(1073741824), '1.0 GB');
    assert.strictEqual(formatPresetSize(1099511627776), '1.0 TB');
  });

  it('beyond TB index yields undefined unit (matches app quirk)', () => {
    const pb = Math.pow(1024, 5);
    const s = formatPresetSize(pb);
    assert.ok(s.includes('undefined'));
  });
});
