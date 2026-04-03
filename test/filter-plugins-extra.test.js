const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Same logic as ui.test.js filterPlugins ──
function filterPlugins(plugins, search, typeFilter, statusFilter) {
  return plugins.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search) ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes(search));
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    let matchesStatus = true;
    if (statusFilter === 'update') matchesStatus = p.hasUpdate === true;
    if (statusFilter === 'current') matchesStatus = p.hasUpdate === false && p.source !== 'not-found';
    if (statusFilter === 'unknown') matchesStatus = !p.hasUpdate && p.source === 'not-found';
    return matchesSearch && matchesType && matchesStatus;
  });
}

describe('filterPlugins edge cases', () => {
  const base = [
    { name: 'A', type: 'VST3', manufacturer: 'Co', hasUpdate: true, source: 'kvr' },
    { name: 'B', type: 'VST2', manufacturer: 'Co', hasUpdate: false, source: 'kvr' },
    { name: 'C', type: 'AU', manufacturer: 'Co', hasUpdate: false, source: 'not-found' },
    { name: 'D', type: 'VST3', manufacturer: null, hasUpdate: false, source: 'kvr' },
  ];

  it('manufacturer null does not throw; co matches name or non-null mfg only', () => {
    assert.doesNotThrow(() => filterPlugins(base, 'co', 'all', 'all'));
    assert.strictEqual(filterPlugins(base, 'co', 'all', 'all').length, 3);
    assert.strictEqual(filterPlugins(base, '', 'all', 'all').length, 4);
  });

  it('search empty string matches all', () => {
    assert.strictEqual(filterPlugins(base, '', 'all', 'all').length, 4);
  });

  it('type VST2 only', () => {
    assert.strictEqual(filterPlugins(base, '', 'VST2', 'all').length, 1);
  });

  it('status current excludes not-found', () => {
    const r = filterPlugins(base, '', 'all', 'current');
    assert.ok(r.every(p => p.source !== 'not-found'));
  });

  it('combined: search + status unknown', () => {
    const r = filterPlugins(base, 'c', 'all', 'unknown');
    assert.strictEqual(r.length, 1);
    assert.strictEqual(r[0].name, 'C');
  });

  it('no manufacturer substring', () => {
    const r = filterPlugins(base, 'zzz', 'all', 'all');
    assert.strictEqual(r.length, 0);
  });
});
