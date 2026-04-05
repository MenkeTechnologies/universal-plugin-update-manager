/**
 * Loads real utils.js + notes.js — item notes/tags prefs model (dedupe, counts, queries).
 */
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts } = require('./frontend-vm-harness.js');

function loadNotesSandbox() {
  return loadFrontendScripts(['utils.js', 'notes.js'], {
    prefs: {
      _cache: {},
      getObject(key, fallback) {
        const v = this._cache[key];
        if (v === undefined || v === null) return fallback;
        return v;
      },
      setItem(key, value) {
        this._cache[key] = value;
      },
      removeItem(key) {
        delete this._cache[key];
      },
    },
    showToast: () => {},
    toastFmt: (key, vars) => (vars ? `${key}:${JSON.stringify(vars)}` : key),
    refreshRowBadges: () => {},
  });
}

describe('frontend/js/notes.js (vm-loaded)', () => {
  let N;

  beforeEach(() => {
    N = loadNotesSandbox();
  });

  it('setNote removes entry when note and tags are both empty', () => {
    N.setNote('/x.wav', 'text', ['t']);
    assert.ok(N.getNote('/x.wav'));
    N.setNote('/x.wav', '', []);
    assert.strictEqual(N.getNote('/x.wav'), null);
  });

  it('getAllTags merges standalone tags and per-item tags, sorted', () => {
    N.prefs._cache.standaloneTags = ['zebra', 'alpha'];
    N.setNote('/a.wav', '', ['beta', 'alpha']);
    assert.strictEqual(N.getAllTags().join(','), 'alpha,beta,zebra');
  });

  it('getTagCounts seeds standalone tags at zero then increments usage', () => {
    N.prefs._cache.standaloneTags = ['orphan'];
    N.setNote('/a.wav', '', ['used']);
    N.setNote('/b.wav', '', ['used']);
    const c = N.getTagCounts();
    assert.strictEqual(c.orphan, 0);
    assert.strictEqual(c.used, 2);
  });

  it('getItemsWithTag and hasTag reflect stored tag arrays', () => {
    N.setNote('/p.wav', 'n', ['drums']);
    const items = N.getItemsWithTag('drums');
    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0].path, '/p.wav');
    assert.strictEqual(N.hasTag('/p.wav', 'drums'), true);
    assert.strictEqual(N.hasTag('/p.wav', 'missing'), false);
  });

  it('renameTag rewrites tags and dedupes when rename collides', () => {
    N.setNote('/1.wav', '', ['old', 'keep']);
    N.setNote('/2.wav', '', ['old']);
    N.renameTag('old', 'keep');
    const n1 = N.getNote('/1.wav');
    assert.ok(n1.tags.includes('keep'));
    assert.strictEqual(new Set(n1.tags).size, n1.tags.length);
    assert.strictEqual(N.getNote('/2.wav').tags.join(','), 'keep');
  });

  it('deleteTag strips tag from all items and standalone list', () => {
    N.prefs._cache.standaloneTags = ['gone', 'stay'];
    N.setNote('/z.wav', '', ['gone']);
    N.deleteTag('gone');
    assert.strictEqual(N.getNote('/z.wav').tags.length, 0);
    assert.ok(!N.getStandaloneTags().includes('gone'));
    assert.ok(N.getStandaloneTags().includes('stay'));
  });

  it('addTagToItem does not duplicate an existing tag', () => {
    N.setNote('/dup.wav', 'x', ['a']);
    N.addTagToItem('/dup.wav', 'a');
    assert.strictEqual(N.getNote('/dup.wav').tags.join(','), 'a');
  });

  it('removeTagFromItem returns early when path has no note', () => {
    assert.doesNotThrow(() => N.removeTagFromItem('/missing.wav', 't'));
  });

  it('setNote keeps entry when note is whitespace-only but tags are non-empty (note text stored verbatim)', () => {
    N.setNote('/ws.wav', '   ', ['only-tag']);
    const n = N.getNote('/ws.wav');
    assert.strictEqual(n.note, '   ');
    assert.strictEqual(n.tags.join(','), 'only-tag');
  });
});
