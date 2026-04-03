const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Logic from frontend/js/disk-usage.js (aggregation + sort + pct) ──
function aggregateBytesByLabel(items, labelKey, bytesKey) {
  const bytes = {};
  for (const item of items) {
    const label = item[labelKey];
    const b = typeof item[bytesKey] === 'number' && Number.isFinite(item[bytesKey]) ? item[bytesKey] : 0;
    bytes[label] = (bytes[label] || 0) + b;
  }
  return Object.entries(bytes).map(([label, b]) => ({ label, bytes: b }));
}

function sortByBytesDesc(data) {
  return [...data].sort((a, b) => b.bytes - a.bytes);
}

function segmentPercentages(data, totalBytes) {
  if (totalBytes === 0) return [];
  return data.map(d => ({
    label: d.label,
    pct: Number(((d.bytes / totalBytes) * 100).toFixed(1)),
  }));
}

function formatAudioSizeStub(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
}

describe('aggregateBytesByLabel', () => {
  it('sums by format', () => {
    const items = [
      { format: 'WAV', size: 100 },
      { format: 'WAV', size: 50 },
      { format: 'MP3', size: 200 },
    ];
    const agg = aggregateBytesByLabel(items, 'format', 'size');
    assert.strictEqual(agg.find(x => x.label === 'WAV').bytes, 150);
    assert.strictEqual(agg.find(x => x.label === 'MP3').bytes, 200);
  });

  it('ignores non-finite sizes', () => {
    const items = [{ format: 'WAV', size: NaN }, { format: 'WAV', size: 10 }];
    const agg = aggregateBytesByLabel(items, 'format', 'size');
    assert.strictEqual(agg[0].bytes, 10);
  });

  it('empty items', () => {
    assert.deepStrictEqual(aggregateBytesByLabel([], 't', 's'), []);
  });
});

describe('sortByBytesDesc', () => {
  it('orders largest first', () => {
    const data = [{ label: 'A', bytes: 1 }, { label: 'B', bytes: 99 }, { label: 'C', bytes: 50 }];
    const s = sortByBytesDesc(data);
    assert.deepStrictEqual(s.map(x => x.label), ['B', 'C', 'A']);
  });

  it('does not mutate original', () => {
    const data = [{ bytes: 2 }, { bytes: 1 }];
    sortByBytesDesc(data);
    assert.strictEqual(data[0].bytes, 2);
  });
});

describe('segmentPercentages', () => {
  it('computes percentages', () => {
    const data = [{ label: 'WAV', bytes: 750 }, { label: 'MP3', bytes: 250 }];
    const p = segmentPercentages(data, 1000);
    assert.strictEqual(p.find(x => x.label === 'WAV').pct, 75);
    assert.strictEqual(p.find(x => x.label === 'MP3').pct, 25);
  });

  it('returns empty for zero total', () => {
    assert.deepStrictEqual(segmentPercentages([{ label: 'X', bytes: 0 }], 0), []);
  });

  it('single segment is 100', () => {
    const p = segmentPercentages([{ label: 'Only', bytes: 1024 }], 1024);
    assert.strictEqual(p[0].pct, 100);
  });
});

describe('formatAudioSizeStub', () => {
  it('formats zero', () => {
    assert.strictEqual(formatAudioSizeStub(0), '0 B');
  });

  it('formats megabytes', () => {
    assert.strictEqual(formatAudioSizeStub(1048576), '1.0 MB');
  });
});
