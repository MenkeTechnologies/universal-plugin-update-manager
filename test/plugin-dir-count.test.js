const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/utils.js buildDirsTable row counts ──
function countPluginsUnderDir(dir, plugins) {
  const prefix = dir.endsWith('/') ? dir : `${dir}/`;
  return plugins.filter(p => p.path.startsWith(prefix)).length;
}

function pluginsUnderDir(dir, plugins) {
  const prefix = dir.endsWith('/') ? dir : `${dir}/`;
  return plugins.filter(p => p.path.startsWith(prefix));
}

describe('countPluginsUnderDir', () => {
  const plugins = [
    { path: '/Lib/Audio/x.vst3', type: 'VST3' },
    { path: '/Lib/Audio/y.vst3', type: 'VST3' },
    { path: '/Other/z.vst3', type: 'VST3' },
  ];

  it('counts only under prefix', () => {
    assert.strictEqual(countPluginsUnderDir('/Lib/Audio', plugins), 2);
  });

  it('zero when no prefix match', () => {
    assert.strictEqual(countPluginsUnderDir('/None', plugins), 0);
  });

  it('dir without trailing slash', () => {
    assert.strictEqual(countPluginsUnderDir('/Lib/Audio/', plugins), 2);
  });

  it('does not count sibling paths that share prefix substring', () => {
    const p = [{ path: '/Lib/Audio2/a.vst3' }];
    assert.strictEqual(countPluginsUnderDir('/Lib/Audio', p), 0);
  });
});

describe('pluginsUnderDir', () => {
  it('returns matching subset', () => {
    const plugins = [
      { path: '/a/p1', type: 'VST3' },
      { path: '/a/p2', type: 'AU' },
      { path: '/b/p3', type: 'VST3' },
    ];
    const sub = pluginsUnderDir('/a', plugins);
    assert.strictEqual(sub.length, 2);
    assert.ok(sub.every(x => x.path.startsWith('/a/')));
  });
});
