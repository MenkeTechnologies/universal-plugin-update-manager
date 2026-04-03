const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/heatmap-dashboard.js buildPluginTypeCard / buildDawFormatCard ──
function countByField(items, field, fallback = 'Unknown') {
  const m = {};
  for (const x of items) {
    const k = x[field] || fallback;
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}

function sortCountsDescending(countMap) {
  return Object.entries(countMap).sort((a, b) => b[1] - a[1]);
}

function barPctOfMax(count, maxCount) {
  if (maxCount <= 0) return 0;
  return (count / maxCount) * 100;
}

function sharePercent(count, total) {
  if (total <= 0) return '0.0';
  return ((count / total) * 100).toFixed(1);
}

function totalSampleBytes(samples) {
  return samples.reduce((s, a) => s + (a.size || a.sizeBytes || 0), 0);
}

describe('countByField', () => {
  it('plugin types', () => {
    const m = countByField(
      [{ type: 'VST3' }, { type: 'VST3' }, { type: 'AU' }],
      'type'
    );
    assert.strictEqual(m.VST3, 2);
    assert.strictEqual(m.AU, 1);
  });

  it('uses fallback', () => {
    const m = countByField([{}], 'type');
    assert.strictEqual(m.Unknown, 1);
  });
});

describe('sortCountsDescending', () => {
  it('orders by count', () => {
    const s = sortCountsDescending({ a: 1, z: 99, m: 5 });
    assert.deepStrictEqual(s.map(x => x[0]), ['z', 'm', 'a']);
  });
});

describe('barPctOfMax', () => {
  it('max row is 100%', () => {
    assert.strictEqual(barPctOfMax(10, 10), 100);
  });

  it('half of max', () => {
    assert.strictEqual(barPctOfMax(5, 10), 50);
  });
});

describe('sharePercent', () => {
  it('third', () => {
    assert.strictEqual(sharePercent(1, 3), '33.3');
  });
});

describe('totalSampleBytes', () => {
  it('prefers size then sizeBytes', () => {
    assert.strictEqual(
      totalSampleBytes([{ size: 10 }, { sizeBytes: 5 }]),
      15
    );
  });

  it('missing sizes are 0', () => {
    assert.strictEqual(totalSampleBytes([{}]), 0);
  });
});
