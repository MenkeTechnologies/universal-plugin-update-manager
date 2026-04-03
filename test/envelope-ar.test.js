const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function adsrEnvelope(t, a, d, s, r, hold) {
  if (t < 0) return 0;
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
  if (t < a + d + hold) return s;
  const rt = t - (a + d + hold);
  if (rt < r) return s * (1 - rt / r);
  return 0;
}

describe('adsrEnvelope', () => {
  it('attack peak', () => assert.ok(Math.abs(adsrEnvelope(0.5, 1, 0.2, 0.5, 0.1, 0) - 0.5) < 1e-9));
});
