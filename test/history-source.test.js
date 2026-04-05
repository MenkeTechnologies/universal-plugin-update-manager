/**
 * Loads real history.js; tests timeAgo() relative copy with a fixed Date.now clock.
 * vm sandbox does not expose Date on the host object — patch Date.now inside the context.
 */
const vm = require('node:vm');
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts } = require('./frontend-vm-harness.js');

function patchSandboxDateNow(sandbox, nowMs) {
  vm.runInContext(
    `globalThis.__testOrigDateNow = Date.now;\nDate.now = function() { return ${nowMs}; };`,
    sandbox,
  );
}

function restoreSandboxDateNow(sandbox) {
  vm.runInContext(
    'Date.now = globalThis.__testOrigDateNow;\ndelete globalThis.__testOrigDateNow;',
    sandbox,
  );
}

function withFixedNow(sandbox, past, offsetMs, fn) {
  const nowMs = past.getTime() + offsetMs;
  patchSandboxDateNow(sandbox, nowMs);
  try {
    fn();
  } finally {
    restoreSandboxDateNow(sandbox);
  }
}

describe('frontend/js/history.js timeAgo (vm-loaded)', () => {
  let H;

  before(() => {
    H = loadFrontendScripts(['utils.js', 'history.js'], {
      showToast: () => {},
      toastFmt: (k) => k,
      window: { vstUpdater: {} },
    });
  });

  it('returns just now under 60 seconds', () => {
    const past = new Date('2025-03-01T12:00:00.000Z');
    withFixedNow(H, past, 45 * 1000, () => {
      assert.strictEqual(H.timeAgo(past), 'just now');
    });
  });

  it('returns minutes below one hour', () => {
    const past = new Date('2025-03-01T12:00:00.000Z');
    withFixedNow(H, past, 23 * 60 * 1000, () => {
      assert.strictEqual(H.timeAgo(past), '23m ago');
    });
  });

  it('returns hours below one day', () => {
    const past = new Date('2025-03-01T08:00:00.000Z');
    withFixedNow(H, past, 5 * 60 * 60 * 1000, () => {
      assert.strictEqual(H.timeAgo(past), '5h ago');
    });
  });

  it('returns days below 30 days', () => {
    const past = new Date('2025-01-01T00:00:00.000Z');
    withFixedNow(H, past, 12 * 24 * 60 * 60 * 1000, () => {
      assert.strictEqual(H.timeAgo(past), '12d ago');
    });
  });

  it('returns months for 30+ day spans', () => {
    const past = new Date('2025-01-01T00:00:00.000Z');
    withFixedNow(H, past, 75 * 24 * 60 * 60 * 1000, () => {
      assert.strictEqual(H.timeAgo(past), '2mo ago');
    });
  });

  it('59s span is just now; 60s span is 1m ago', () => {
    const past = new Date('2025-06-01T15:00:00.000Z');
    withFixedNow(H, past, 59 * 1000, () => {
      assert.strictEqual(H.timeAgo(past), 'just now');
    });
    withFixedNow(H, past, 60 * 1000, () => {
      assert.strictEqual(H.timeAgo(past), '1m ago');
    });
  });

  it('exactly 30 days uses month bucket (not day)', () => {
    const past = new Date('2025-01-01T12:00:00.000Z');
    withFixedNow(H, past, 30 * 24 * 60 * 60 * 1000, () => {
      assert.strictEqual(H.timeAgo(past), '1mo ago');
    });
  });
});
