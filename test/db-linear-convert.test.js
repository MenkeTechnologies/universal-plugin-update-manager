const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function linearToDb(linear) {
  if (linear <= 0) return -Infinity;
  return 20 * Math.log10(linear);
}

function dbToLinear(db) {
  return 10 ** (db / 20);
}

describe('linearToDb', () => {
  it('unity is 0 dB', () => assert.ok(Math.abs(linearToDb(1)) < 1e-9));
  it('half is ~-6', () => assert.ok(linearToDb(0.5) < -5.9 && linearToDb(0.5) > -6.1));
});

describe('dbToLinear roundtrip', () => {
  it('near unity', () => {
    const x = dbToLinear(linearToDb(0.7));
    assert.ok(Math.abs(x - 0.7) < 1e-10);
  });
});
