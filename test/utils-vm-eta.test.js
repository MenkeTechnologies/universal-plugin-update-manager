/**
 * createETA from frontend/js/utils.js — remaining time / elapsed strings.
 */
const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts, defaultDocument } = require('./frontend-vm-harness.js');

describe('frontend/js/utils.js createETA', () => {
  let U;
  let mockNow;

  before(() => {
    // createETA uses `if (!startTime)` — 0 from performance.now() is treated as unset.
    mockNow = 10_000;
    U = loadFrontendScripts(['utils.js'], {
      document: defaultDocument(),
      performance: {
        now: () => mockNow,
      },
    });
  });

  beforeEach(() => {
    mockNow = 10_000;
  });

  it('estimate returns empty until start', () => {
    const eta = U.createETA();
    assert.strictEqual(eta.estimate(10, 100), '');
  });

  it('estimate returns empty for invalid progress', () => {
    const eta = U.createETA();
    eta.start();
    assert.strictEqual(eta.estimate(0, 100), '');
    assert.strictEqual(eta.estimate(5, 0), '');
  });

  it('estimate formats seconds when under a minute', () => {
    const eta = U.createETA();
    mockNow = 50_000;
    eta.start();
    mockNow = 51_000;
    const out = eta.estimate(10, 100);
    assert.match(out, /^~\d+s$/);
  });

  it('estimate uses < 1s when remaining under one second', () => {
    const eta = U.createETA();
    mockNow = 100_000;
    eta.start();
    mockNow = 101_000;
    assert.strictEqual(eta.estimate(99_999, 100_000), '< 1s');
  });

  it('estimate formats minutes for long remaining', () => {
    const eta = U.createETA();
    mockNow = 200_000;
    eta.start();
    mockNow = 201_000;
    const out = eta.estimate(1, 121);
    assert.match(out, /^~\d+m \d+s$/);
  });

  it('elapsed returns empty before start', () => {
    const eta = U.createETA();
    assert.strictEqual(eta.elapsed(), '');
  });

  it('elapsed shows seconds then minutes', () => {
    const eta = U.createETA();
    mockNow = 1_000_000;
    eta.start();
    mockNow = 1_030_000;
    assert.strictEqual(eta.elapsed(), '30s');
    mockNow = 1_125_000;
    assert.strictEqual(eta.elapsed(), '2m 5s');
  });
});
