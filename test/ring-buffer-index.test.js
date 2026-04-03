const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Ring buffer write index (visualizer spectrogram pattern) ──
function nextRingIndex(current, len) {
  if (len <= 0) return 0;
  return (current + 1) % len;
}

describe('nextRingIndex', () => {
  it('wraps at end', () => {
    assert.strictEqual(nextRingIndex(4, 5), 0);
  });

  it('increments', () => {
    assert.strictEqual(nextRingIndex(0, 10), 1);
  });

  it('zero length safe', () => {
    assert.strictEqual(nextRingIndex(3, 0), 0);
  });
});
