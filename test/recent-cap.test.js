const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Pattern from frontend/js/audio.js recentlyPlayed + MAX_RECENT ──
function pushRecentPlayed(list, entry, max) {
  const path = entry.path;
  const without = list.filter(r => r.path !== path);
  const next = [{ ...entry }, ...without];
  return next.slice(0, max);
}

describe('pushRecentPlayed', () => {
  it('prepends new entry', () => {
    const r = pushRecentPlayed([], { path: '/a.wav', title: 'A' }, 50);
    assert.strictEqual(r[0].path, '/a.wav');
  });

  it('moves duplicate path to front', () => {
    const r = pushRecentPlayed(
      [{ path: '/a.wav' }, { path: '/b.wav' }],
      { path: '/b.wav', title: 'B2' },
      50
    );
    assert.strictEqual(r[0].path, '/b.wav');
    assert.strictEqual(r.filter(x => x.path === '/b.wav').length, 1);
  });

  it('caps at max', () => {
    const base = Array.from({ length: 60 }, (_, i) => ({ path: `/f${i}.wav` }));
    const r = pushRecentPlayed(base, { path: '/new.wav' }, 50);
    assert.strictEqual(r.length, 50);
    assert.strictEqual(r[0].path, '/new.wav');
  });

  it('max 1 keeps only latest', () => {
    const r = pushRecentPlayed([{ path: '/old.wav' }], { path: '/n.wav' }, 1);
    assert.strictEqual(r.length, 1);
    assert.strictEqual(r[0].path, '/n.wav');
  });
});
