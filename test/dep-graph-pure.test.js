const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/dep-graph.js buildDepGraphData type aggregation ──
function aggregateTypeCounts(pluginsByUsage) {
  const typeCounts = {};
  for (const p of pluginsByUsage) {
    const t = p.type || 'Unknown';
    typeCounts[t] = (typeCounts[t] || 0) + p.count;
  }
  return typeCounts;
}

function sortByUsageDesc(pluginEntries) {
  return [...pluginEntries].sort((a, b) => b.count - a.count);
}

function referencedNormalizedKeys(pluginProjects) {
  return new Set(Object.keys(pluginProjects));
}

function findOrphanedPlugins(allPlugins, referencedKeys, normalizeName) {
  const orphaned = [];
  for (const p of allPlugins) {
    const norm = normalizeName(p.name);
    if (!referencedKeys.has(norm)) orphaned.push(p);
  }
  return orphaned;
}

describe('aggregateTypeCounts', () => {
  it('sums counts by plugin type', () => {
    const data = [
      { type: 'VST3', count: 5 },
      { type: 'VST3', count: 3 },
      { type: 'AU', count: 2 },
    ];
    const c = aggregateTypeCounts(data);
    assert.strictEqual(c.VST3, 8);
    assert.strictEqual(c.AU, 2);
  });

  it('uses Unknown for missing type', () => {
    const c = aggregateTypeCounts([{ count: 1 }]);
    assert.strictEqual(c.Unknown, 1);
  });
});

describe('sortByUsageDesc', () => {
  it('orders by count descending', () => {
    const s = sortByUsageDesc([
      { key: 'a', count: 1 },
      { key: 'b', count: 99 },
    ]);
    assert.strictEqual(s[0].key, 'b');
  });
});

describe('referencedNormalizedKeys', () => {
  it('returns keys as set', () => {
    const s = referencedNormalizedKeys({ serum: {}, massive: {} });
    assert.ok(s.has('serum'));
    assert.strictEqual(s.size, 2);
  });
});

describe('findOrphanedPlugins', () => {
  const norm = s => s.toLowerCase();
  it('lists plugins not in reference set', () => {
    const plugins = [{ name: 'A' }, { name: 'B' }];
    const o = findOrphanedPlugins(plugins, new Set(['a']), norm);
    assert.strictEqual(o.length, 1);
    assert.strictEqual(o[0].name, 'B');
  });
});
