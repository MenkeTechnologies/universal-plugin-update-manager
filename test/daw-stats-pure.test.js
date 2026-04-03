const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/daw.js accumulateDawStats / updateDawStats "other" logic ──
const MAIN_DAWS = ['Ableton Live', 'Logic Pro', 'FL Studio', 'REAPER'];

function accumulateDawStats(projects) {
  const counts = {};
  let bytes = 0;
  for (const p of projects) {
    counts[p.daw] = (counts[p.daw] || 0) + 1;
    bytes += p.size || 0;
  }
  return { counts, bytes };
}

function mainDawTotal(counts) {
  return MAIN_DAWS.reduce((s, d) => s + (counts[d] || 0), 0);
}

function otherDawCount(totalProjects, counts) {
  return totalProjects - mainDawTotal(counts);
}

describe('accumulateDawStats', () => {
  it('counts per daw and sums bytes', () => {
    const { counts, bytes } = accumulateDawStats([
      { daw: 'Ableton Live', size: 100 },
      { daw: 'Ableton Live', size: 50 },
      { daw: 'REAPER', size: 10 },
    ]);
    assert.strictEqual(counts['Ableton Live'], 2);
    assert.strictEqual(counts.REAPER, 1);
    assert.strictEqual(bytes, 160);
  });

  it('empty', () => {
    const { counts, bytes } = accumulateDawStats([]);
    assert.deepStrictEqual(counts, {});
    assert.strictEqual(bytes, 0);
  });
});

describe('mainDawTotal / otherDawCount', () => {
  it('other is total minus main four', () => {
    const counts = {
      'Ableton Live': 2,
      'Logic Pro': 1,
      'FL Studio': 0,
      REAPER: 3,
      Bitwig: 5,
    };
    assert.strictEqual(mainDawTotal(counts), 6);
    assert.strictEqual(otherDawCount(11, counts), 5);
  });
});
