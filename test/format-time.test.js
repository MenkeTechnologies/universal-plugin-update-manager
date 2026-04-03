const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/utils.js formatTime ──
function formatTime(sec) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}

describe('formatTime', () => {
  it('zero and invalid', () => {
    assert.strictEqual(formatTime(0), '0:00');
    assert.strictEqual(formatTime(null), '0:00');
    assert.strictEqual(formatTime(undefined), '0:00');
    assert.strictEqual(formatTime(NaN), '0:00');
    assert.strictEqual(formatTime(Infinity), '0:00');
  });

  it('sub-minute', () => {
    assert.strictEqual(formatTime(5), '0:05');
    assert.strictEqual(formatTime(59), '0:59');
  });

  it('exact minutes', () => {
    assert.strictEqual(formatTime(60), '1:00');
    assert.strictEqual(formatTime(120), '2:00');
  });

  it('floors fractional seconds', () => {
    assert.strictEqual(formatTime(90.9), '1:30');
    assert.strictEqual(formatTime(61.99), '1:01');
  });

  it('long tracks', () => {
    assert.strictEqual(formatTime(3599), '59:59');
    assert.strictEqual(formatTime(3600), '60:00');
  });
});
