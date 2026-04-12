/**
 * Mirrors frontend/js/visualizer.js `_vizOscilloscopeTriggerIndex` (Float32 time-domain, ~[-1,1]).
 * MUST stay in sync with that function.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function _vizOscilloscopeTriggerIndex(data, bufLen) {
  for (let i = 1; i < bufLen; i++) {
    if (data[i - 1] < 0 && data[i] >= 0) return i;
  }
  return -1;
}

describe('visualizer _vizOscilloscopeTriggerIndex mirror', () => {
  it('returns -1 for empty or single sample', () => {
    const f = new Float32Array(4);
    assert.strictEqual(_vizOscilloscopeTriggerIndex(f, 0), -1);
    assert.strictEqual(_vizOscilloscopeTriggerIndex(f, 1), -1);
  });

  it('detects first rising zero-cross', () => {
    const f = Float32Array.from([-0.2, -0.05, 0.01, 0.3]);
    assert.strictEqual(_vizOscilloscopeTriggerIndex(f, 4), 2);
  });

  it('treats exactly zero on the right as a crossing', () => {
    const f = Float32Array.from([-0.1, 0]);
    assert.strictEqual(_vizOscilloscopeTriggerIndex(f, 2), 1);
  });

  it('returns -1 when signal stays non-negative', () => {
    const f = Float32Array.from([0.1, 0.2, 0.3]);
    assert.strictEqual(_vizOscilloscopeTriggerIndex(f, 3), -1);
  });

  it('returns -1 when signal stays negative', () => {
    const f = Float32Array.from([-0.5, -0.1, -0.05]);
    assert.strictEqual(_vizOscilloscopeTriggerIndex(f, 3), -1);
  });

  it('uses bufLen cap so trailing slots are ignored', () => {
    const f = Float32Array.from([-0.2, -0.05, 0.1, 0.9, 0.9]);
    assert.strictEqual(_vizOscilloscopeTriggerIndex(f, 3), 2);
  });
});
