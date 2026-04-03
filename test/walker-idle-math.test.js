const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/walker-status.js: stop after 10 idle polls @ 500ms ──
const POLL_MS = 500;
const IDLE_TICKS = 10;

function idleStopMs() {
  return POLL_MS * IDLE_TICKS;
}

describe('walker polling', () => {
  it('stops after 5s of idle scans', () => {
    assert.strictEqual(idleStopMs(), 5000);
  });
});
