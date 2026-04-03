const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

/** Same normalization as `similarity::fingerprint_distance` (Rust). */
function norm(va, vb, maxv) {
  const m = Math.max(maxv, 1e-10);
  const da = va / m;
  const db = vb / m;
  return (da - db) ** 2;
}

function fingerprintDistance(a, b) {
  const d =
    norm(a.rms, b.rms, 1.0) +
    norm(a.sc, b.sc, 0.5) +
    norm(a.zcr, b.zcr, 0.5) +
    norm(a.low, b.low, 1.0) +
    norm(a.mid, b.mid, 1.0) +
    norm(a.high, b.high, 1.0) +
    norm(a.lr, b.lr, 1.0) +
    norm(a.at, b.at, 2.0);
  return Math.sqrt(d);
}

function fpTemplate(rms) {
  return {
    rms,
    sc: 0.25,
    zcr: 0.04,
    low: 0.33,
    mid: 0.34,
    high: 0.33,
    lr: 0.45,
    at: 0.02,
  };
}

describe('fingerprint_distance RMS grid (bulk)', () => {
  const vals = Array.from({ length: 21 }, (_, i) => i * 0.05);
  for (let i = 0; i < vals.length; i++) {
    for (let j = i; j < vals.length; j++) {
      const ra = vals[i];
      const rb = vals[j];
      it(`rms ${ra} ${rb}`, () => {
        const a = fpTemplate(ra);
        const b = fpTemplate(rb);
        const d = fingerprintDistance(a, b);
        assert.equal(fingerprintDistance(b, a), d);
        assert.ok(Number.isFinite(d));
        assert.ok(d >= 0);
      });
    }
  }
});

describe('fingerprint_distance spectral_centroid grid (bulk)', () => {
  const vals = Array.from({ length: 21 }, (_, i) => i * 0.05);
  for (let i = 0; i < vals.length; i++) {
    for (let j = i; j < vals.length; j++) {
      const sa = vals[i];
      const sb = vals[j];
      it(`sc ${sa} ${sb}`, () => {
        const a = { ...fpTemplate(0.5), sc: sa };
        const b = { ...fpTemplate(0.5), sc: sb };
        const d = fingerprintDistance(a, b);
        assert.equal(fingerprintDistance(b, a), d);
      });
    }
  }
});
