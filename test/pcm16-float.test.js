const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function pcm16ToFloat(s) {
  return s / 32768;
}

function floatToPcm16(x) {
  const c = Math.max(-1, Math.min(1, x));
  let v = c < 0 ? c * 0x8000 : c * 0x7fff;
  v = Math.trunc(v);
  if (v > 32767) v = 32767;
  if (v < -32768) v = -32768;
  return v | 0;
}

describe('pcm16ToFloat', () => {
  it('max', () => assert.ok(Math.abs(pcm16ToFloat(32767) - 32767 / 32768) < 1e-6));
  it('zero', () => assert.strictEqual(pcm16ToFloat(0), 0));
  it('negative min', () => assert.ok(Math.abs(pcm16ToFloat(-32768) - (-1)) < 1e-6));
  it('half', () =>
    assert.ok(Math.abs(pcm16ToFloat(16383) - 16383 / 32768) < 1e-6));
  it('quarter', () =>
    assert.ok(Math.abs(pcm16ToFloat(8191) - 8191 / 32768) < 1e-6));
  it('one third', () => assert.ok(Math.abs(pcm16ToFloat(10922) - 0.3337) < 1e-3));
  it('small value', () => assert.ok(Math.abs(pcm16ToFloat(1) - 1 / 32768) < 1e-9));
  it('large value', () => assert.ok(Math.abs(pcm16ToFloat(-32760) - (-0.9998)) < 1e-3));
});

describe('floatToPcm16', () => {
  it('roundtrip', () => {
    const s = floatToPcm16(0.5);
    assert.ok(Math.abs(pcm16ToFloat(s) - 0.5) < 0.001);
  });
  it('zero', () => assert.strictEqual(floatToPcm16(0), 0));
  it('positive one', () => assert.ok(Math.abs(floatToPcm16(1) - 32767) < 1));
  it('negative one', () => assert.ok(Math.abs(floatToPcm16(-1) - (-32768)) < 1));
  it('clip max', () => assert.strictEqual(floatToPcm16(2), 32767));
  it('clip min', () => assert.strictEqual(floatToPcm16(-2), -32768));
  // `0.999 * 32767` is ~32734.23 in float — does not exceed int16 max; clamp only applies past that.
  it('clip small pos', () => assert.strictEqual(floatToPcm16(0.999), 32734));
  it('clip small neg', () =>
    assert.strictEqual(floatToPcm16(-0.999), (-0.999 * 0x8000) | 0));
  it('half', () => assert.strictEqual(floatToPcm16(0.5), 16383));
  it('quarter', () => assert.strictEqual(floatToPcm16(0.25), 8191));
  it('one eighth', () => assert.strictEqual(floatToPcm16(0.125), 4095));
  it('one twoeighth', () => assert.strictEqual(floatToPcm16(0.0625), 2047));
  it('clip subnormal', () => assert.strictEqual(floatToPcm16(1e-10), 0));
});

describe('pcm16 roundtrip for all values', () => {
  const values = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
  const negations = [-1, -0.875, -0.75, -0.625, -0.5, -0.375, -0.25, -0.125, 0];
  for (const v of [...values, ...negations]) {
    it(`roundtrip ${v}`, () => {
      const s = floatToPcm16(v);
      const r = pcm16ToFloat(s);
      assert.ok(Math.abs(r - v) < 0.001);
    });
  }
});
