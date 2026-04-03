const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const DEG = Math.PI / 180;

function degToRad(d) {
  return d * DEG;
}

function radToDeg(r) {
  return r / DEG;
}

describe('deg/rad', () => {
  it('roundtrip', () => assert.ok(Math.abs(radToDeg(degToRad(90)) - 90) < 1e-9));
});
