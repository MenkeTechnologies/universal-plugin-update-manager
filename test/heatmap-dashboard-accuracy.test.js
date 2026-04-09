/**
 * Numerical accuracy: heatmap card HTML reflects correct totals, bucket sums,
 * and percentage denominators (avoids silent drift when aggregates or bucketing change).
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts, defaultDocument } = require('./frontend-vm-harness.js');

function loadHm(extra = {}) {
  return loadFrontendScripts(['utils.js', 'heatmap-dashboard.js'], {
    appFmt: (k, vars) => (vars ? `${k}:${JSON.stringify(vars)}` : k),
    catalogFmt: (k, vars) => (vars ? `${k}:${JSON.stringify(vars)}` : k),
    document: {
      ...defaultDocument(),
      addEventListener: () => {},
    },
    requestAnimationFrame: (cb) => {
      if (typeof cb === 'function') cb();
      return 0;
    },
    ...extra,
  });
}

/** `hm-bar-val` rows inside one `data-hm-card="…"` block */
function extractBarRows(html, card) {
  const start = html.indexOf(`data-hm-card="${card}"`);
  if (start === -1) return [];
  const rest = html.slice(start);
  const next = rest.indexOf('data-hm-card="', 20);
  const block = next === -1 ? rest : rest.slice(0, next);
  const rows = [];
  for (const m of block.matchAll(/hm-bar-val">([\d,]+)\s*\(([\d.]+)%\)/g)) {
    rows.push({
      count: parseInt(String(m[1]).replace(/,/g, ''), 10),
      pct: parseFloat(m[2]),
    });
  }
  return rows;
}

describe('heatmap-dashboard.js accuracy', () => {
  let H;

  before(() => {
    H = loadHm();
  });

  it('_hmOverviewTotals prefers DB aggregate counts and normalizes bigint bytes', () => {
    const t = H._hmOverviewTotals(
      {
        audio: { count: 1_234_567, totalBytes: 4096n },
        plugins: { count: 88 },
        daw: { count: 12 },
        presets: { count: 9001 },
      },
      [],
      [],
      [],
      []
    );
    assert.strictEqual(t.nSamples, 1234567);
    assert.strictEqual(t.nPlugins, 88);
    assert.strictEqual(t.nDaw, 12);
    assert.strictEqual(t.nPresets, 9001);
    assert.strictEqual(t.totalBytes, 4096);
  });

  it('_hmOverviewTotals treats missing aggregate fields as zero', () => {
    const t = H._hmOverviewTotals({ audio: {}, plugins: {}, daw: {}, presets: {} }, [], [], [], []);
    assert.strictEqual(t.nSamples, 0);
    assert.strictEqual(t.totalBytes, 0);
  });

  it('buildFormatCard sample path: bar counts sum to number of samples', () => {
    const samples = [
      { format: 'WAV' },
      { format: 'WAV' },
      { format: 'MP3' },
      { format: 'FLAC' },
      { format: 'FLAC' },
      { format: 'FLAC' },
    ];
    const html = H.buildFormatCard(samples);
    const rows = extractBarRows(html, 'format');
    const sumCounts = rows.reduce((s, r) => s + r.count, 0);
    assert.strictEqual(sumCounts, samples.length);
    const sumPct = rows.reduce((s, r) => s + r.pct, 0);
    /* Each row uses toFixed(1); rounded shares can sum to 100.1 etc. */
    assert.ok(Math.abs(sumPct - 100) < 0.15, `shares should sum to ~100%, got ${sumPct}`);
  });

  it('buildFormatCard aggregate byType: counts sum to aggregate total', () => {
    const agg = {
      audio: {
        byType: { WAV: 10, MP3: 5, OGG: 3 },
      },
    };
    const html = H.buildFormatCard([], agg);
    const rows = extractBarRows(html, 'format');
    const sumCounts = rows.reduce((s, r) => s + r.count, 0);
    assert.strictEqual(sumCounts, 18);
    const sumPct = rows.reduce((s, r) => s + r.pct, 0);
    assert.ok(Math.abs(sumPct - 100) < 0.15);
  });

  it('buildSizeCard sample path: bucket counts sum to sample count', () => {
    const samples = [
      { sizeBytes: 10 },
      { sizeBytes: 150 * 1024 },
      { sizeBytes: 2 * 1024 * 1024 },
      { sizeBytes: 20 * 1024 * 1024 },
      { sizeBytes: 80 * 1024 * 1024 },
      { sizeBytes: 200 * 1024 * 1024 },
    ];
    const html = H.buildSizeCard(samples);
    const rows = extractBarRows(html, 'size');
    const sumCounts = rows.reduce((s, r) => s + r.count, 0);
    assert.strictEqual(sumCounts, samples.length);
  });

  it('buildSizeCard places 100 KiB boundary in second bucket (exclusive upper bound on first)', () => {
    const below = H.buildSizeCard([{ sizeBytes: 100 * 1024 - 1 }]);
    const rowsB = extractBarRows(below, 'size');
    assert.strictEqual(rowsB[0].count, 1);
    assert.strictEqual(rowsB[1].count, 0);

    const at = H.buildSizeCard([{ sizeBytes: 100 * 1024 }]);
    const rowsA = extractBarRows(at, 'size');
    assert.strictEqual(rowsA[0].count, 0);
    assert.strictEqual(rowsA[1].count, 1);
  });

  it('buildSizeCard DB sizeBuckets: bucket counts sum matches library count for percentages', () => {
    const buckets = [2, 3, 1, 0, 0, 0];
    const lib = 6000;
    const html = H.buildSizeCard(
      [{ sizeBytes: 1 }],
      {
        audio: {
          count: lib,
          sizeBuckets: buckets,
        },
      }
    );
    const rows = extractBarRows(html, 'size');
    const sumCounts = rows.reduce((s, r) => s + r.count, 0);
    assert.strictEqual(sumCounts, buckets.reduce((a, b) => a + b, 0));
    for (const r of rows) {
      const expected = ((r.count / lib) * 100).toFixed(1);
      assert.strictEqual(r.pct, parseFloat(expected));
    }
  });

  it('buildPluginTypeCard in-memory: type counts sum to plugin list length', () => {
    const plugins = [
      { type: 'VST3' },
      { type: 'VST3' },
      { type: 'AU' },
    ];
    const html = H.buildPluginTypeCard(plugins);
    const rows = extractBarRows(html, 'pluginTypes');
    const sumCounts = rows.reduce((s, r) => s + r.count, 0);
    assert.strictEqual(sumCounts, plugins.length);
    const sumPct = rows.reduce((s, r) => s + r.pct, 0);
    assert.ok(Math.abs(sumPct - 100) < 0.15);
  });

  it('buildDawFormatCard in-memory: counts sum to project list length', () => {
    const projects = [
      { daw: 'Ableton Live', format: 'ALS' },
      { daw: 'Ableton Live', format: 'ALS' },
      { daw: 'REAPER', format: 'RPP' },
    ];
    const html = H.buildDawFormatCard(projects);
    const rows = extractBarRows(html, 'dawFormats');
    const sumCounts = rows.reduce((s, r) => s + r.count, 0);
    assert.strictEqual(sumCounts, projects.length);
    const sumPct = rows.reduce((s, r) => s + r.pct, 0);
    assert.ok(Math.abs(sumPct - 100) < 0.15);
  });

  it('buildFormatCard prefers audioStatCounts when no aggregate byType', () => {
    const S = loadHm({ audioStatCounts: { WAV: 4, FLAC: 1 } });
    const html = S.buildFormatCard([], {});
    const rows = extractBarRows(html, 'format');
    assert.strictEqual(rows.reduce((s, r) => s + r.count, 0), 5);
    const sumPct = rows.reduce((s, r) => s + r.pct, 0);
    assert.ok(Math.abs(sumPct - 100) < 0.15);
  });

  it('buildPluginTypeCard aggregate byType: counts sum to total', () => {
    const html = H.buildPluginTypeCard([], {
      plugins: { byType: { VST3: 7, AU: 3, CLAP: 2 } },
    });
    const rows = extractBarRows(html, 'pluginTypes');
    assert.strictEqual(rows.reduce((s, r) => s + r.count, 0), 12);
    const sumPct = rows.reduce((s, r) => s + r.pct, 0);
    assert.ok(Math.abs(sumPct - 100) < 0.15);
  });

  it('buildDawFormatCard aggregate daw.byType: counts sum to total', () => {
    const html = H.buildDawFormatCard([], {
      daw: { byType: { ALS: 4, RPP: 1 } },
    });
    const rows = extractBarRows(html, 'dawFormats');
    assert.strictEqual(rows.reduce((s, r) => s + r.count, 0), 5);
    const sumPct = rows.reduce((s, r) => s + r.pct, 0);
    assert.ok(Math.abs(sumPct - 100) < 0.15);
  });

  it('buildFolderCard sample path: folder bucket counts sum to sample count', () => {
    const samples = [
      { path: '/Lib/One/a.wav' },
      { path: '/Lib/One/b.wav' },
      { path: '/Other/p/x.wav' },
    ];
    const html = H.buildFolderCard(samples, {});
    const rows = extractBarRows(html, 'folders');
    const sumCounts = rows.reduce((s, r) => s + r.count, 0);
    assert.strictEqual(sumCounts, samples.length);
    const sumPct = rows.reduce((s, r) => s + r.pct, 0);
    assert.ok(Math.abs(sumPct - 100) < 0.15);
  });

  it('buildFolderCard DB topFolders: percentages use library count as denominator', () => {
    const lib = 10_000;
    const html = H.buildFolderCard([], {
      audio: {
        count: lib,
        topFolders: [
          { path: '/a/b', count: 2500 },
          { path: '/c/d', count: 1500 },
        ],
      },
    });
    const rows = extractBarRows(html, 'folders');
    assert.strictEqual(rows[0].pct, parseFloat(((2500 / lib) * 100).toFixed(1)));
    assert.strictEqual(rows[1].pct, parseFloat(((1500 / lib) * 100).toFixed(1)));
  });

  it('BPM histogram binning (same rules as renderBpmHistogram in-memory path)', () => {
    const minBpm = 50;
    const maxBpm = 220;
    const binWidth = 5;
    const numBins = Math.ceil((maxBpm - minBpm) / binWidth);
    assert.strictEqual(numBins, 34);
    const bpms = [60, 60, 130, 49, 221];
    const bins = new Array(numBins).fill(0);
    for (const bpm of bpms) {
      if (!bpm || bpm <= 0) continue;
      const idx = Math.floor((bpm - minBpm) / binWidth);
      if (idx >= 0 && idx < numBins) bins[idx]++;
    }
    /* 49 -> idx -1 excluded; 221 -> idx 34 excluded */
    assert.strictEqual(bins.reduce((a, b) => a + b, 0), 3);
    assert.strictEqual(bins[2], 2);
    assert.strictEqual(bins[16], 1);
  });

  it('renderKeyWheel keyCounts: sorted counts sum matches keyAnalyzedCount when provided', () => {
    const keyCounts = { 'C Major': 10, 'A Minor': 5 };
    const analyzed = 15;
    const sorted = Object.entries(keyCounts)
      .map(([k, c]) => [k, Number(c) || 0])
      .sort((x, y) => y[1] - x[1]);
    const keyTotal =
      typeof analyzed === 'number' && analyzed > 0
        ? analyzed
        : sorted.reduce((s, [, c]) => s + c, 0);
    assert.strictEqual(sorted.reduce((s, [, c]) => s + c, 0), keyTotal);
    assert.strictEqual(
      ((sorted[0][1] / Math.max(keyTotal, 1)) * 100).toFixed(0),
      '67'
    );
  });

  it('timeline month grouping (same logic as renderTimelineChart) sums to samples with YYYY-MM', () => {
    const samples = [
      { modified: '2024-06-15T12:00:00Z' },
      { modified: '2024-06-20T08:00:00Z' },
      { modified: '2024-07-01T00:00:00Z' },
      { modified: 'bad' },
      {},
    ];
    const months = {};
    for (const s of samples) {
      if (!s.modified) continue;
      const m = s.modified.slice(0, 7);
      if (m.length === 7 && m[4] === '-') months[m] = (months[m] || 0) + 1;
    }
    const monthSum = Object.values(months).reduce((a, b) => a + b, 0);
    assert.strictEqual(monthSum, 3);
    assert.strictEqual(months['2024-06'], 2);
    assert.strictEqual(months['2024-07'], 1);
  });
});
