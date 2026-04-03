const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/visualizer.js _drawLevels ──
function ampToDb(amp) {
  return amp > 0 ? 20 * Math.log10(amp) : -96;
}

function dbToMeterPct(db) {
  return Math.max(0, Math.min(1, (db + 60) / 60));
}

describe('ampToDb', () => {
  it('silence floor', () => {
    assert.strictEqual(ampToDb(0), -96);
    assert.strictEqual(ampToDb(-1), -96);
  });

  it('full scale', () => {
    assert.ok(Math.abs(ampToDb(1) - 0) < 0.001);
  });

  it('half amplitude ~ -6 dB', () => {
    const db = ampToDb(0.5);
    assert.ok(db < -5 && db > -7);
  });
});

describe('dbToMeterPct', () => {
  it('maps -60 dB to 0', () => {
    assert.strictEqual(dbToMeterPct(-60), 0);
  });

  it('maps 0 dB to 1', () => {
    assert.strictEqual(dbToMeterPct(0), 1);
  });

  it('clamps below range', () => {
    assert.strictEqual(dbToMeterPct(-100), 0);
  });

  it('clamps above range', () => {
    assert.strictEqual(dbToMeterPct(6), 1);
  });

  it('mid scale', () => {
    assert.ok(Math.abs(dbToMeterPct(-30) - 0.5) < 0.001);
  });
});
