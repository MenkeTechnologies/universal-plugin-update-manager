/**
 * Loads real utils.js + notes.js — item notes/tags SQLite model (dedupe, counts, queries).
 */
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts } = require('./frontend-vm-harness.js');

/** In-memory vstUpdater mock backing notes, tags, and favorites. */
function createVstUpdaterMock() {
  const notes = {};
  let standaloneTags = [];
  return {
    _notes: notes,
    setStandaloneTags(tags) { standaloneTags = tags.slice(); },
    async favoritesList() { return []; },
    async notesGetAll() { return JSON.parse(JSON.stringify(notes)); },
    async tagsStandaloneList() { return standaloneTags.slice(); },
    async noteSet(path, note, tags) {
      if (!note && (!tags || tags.length === 0)) { delete notes[path]; return; }
      notes[path] = { note, tags: tags || [] };
    },
    async tagAddToItem(path, tag) {
      if (!notes[path]) notes[path] = { note: '', tags: [] };
      if (notes[path].tags.includes(tag)) return false;
      notes[path].tags.push(tag);
      return true;
    },
    async tagRemoveFromItem(path, tag) {
      if (notes[path]) notes[path].tags = notes[path].tags.filter(t => t !== tag);
    },
    async tagRename(oldTag, newTag) {
      let changed = 0;
      for (const n of Object.values(notes)) {
        const idx = n.tags.indexOf(oldTag);
        if (idx !== -1) { n.tags[idx] = newTag; n.tags = [...new Set(n.tags)]; changed++; }
      }
      const sIdx = standaloneTags.indexOf(oldTag);
      if (sIdx !== -1) { standaloneTags[sIdx] = newTag; standaloneTags = [...new Set(standaloneTags)]; }
      return changed;
    },
    async tagDelete(tag) {
      let changed = 0;
      for (const n of Object.values(notes)) {
        const idx = n.tags.indexOf(tag);
        if (idx !== -1) { n.tags.splice(idx, 1); changed++; }
      }
      standaloneTags = standaloneTags.filter(t => t !== tag);
      return changed;
    },
  };
}

function loadNotesSandbox(vstMock) {
  return loadFrontendScripts(['utils.js', 'notes.js'], {
    CSS: { escape: (v) => v },
    vstUpdater: vstMock,
    showToast: () => {},
    toastFmt: (key, vars) => (vars ? `${key}:${JSON.stringify(vars)}` : key),
  });
}

describe('frontend/js/notes.js (vm-loaded)', () => {
  let N, vst;

  beforeEach(() => {
    vst = createVstUpdaterMock();
    N = loadNotesSandbox(vst);
  });

  it('setNote removes entry when note and tags are both empty', async () => {
    await N.setNote('/x.wav', 'text', ['t']);
    assert.ok(N.getNote('/x.wav'));
    await N.setNote('/x.wav', '', []);
    assert.strictEqual(N.getNote('/x.wav'), null);
  });

  it('getAllTags merges standalone tags and per-item tags, sorted', async () => {
    vst.setStandaloneTags(['zebra', 'alpha']);
    await N.setNote('/a.wav', '', ['beta', 'alpha']);
    assert.strictEqual(N.getAllTags().join(','), 'alpha,beta,zebra');
  });

  it('getTagCounts seeds standalone tags at zero then increments usage', async () => {
    vst.setStandaloneTags(['orphan']);
    await N.setNote('/a.wav', '', ['used']);
    await N.setNote('/b.wav', '', ['used']);
    const c = N.getTagCounts();
    assert.strictEqual(c.orphan, 0);
    assert.strictEqual(c.used, 2);
  });

  it('getItemsWithTag and hasTag reflect stored tag arrays', async () => {
    await N.setNote('/p.wav', 'n', ['drums']);
    const items = N.getItemsWithTag('drums');
    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0].path, '/p.wav');
    assert.strictEqual(N.hasTag('/p.wav', 'drums'), true);
    assert.strictEqual(N.hasTag('/p.wav', 'missing'), false);
  });

  it('renameTag rewrites tags and dedupes when rename collides', async () => {
    await N.setNote('/1.wav', '', ['old', 'keep']);
    await N.setNote('/2.wav', '', ['old']);
    await N.renameTag('old', 'keep');
    const n1 = N.getNote('/1.wav');
    assert.ok(n1.tags.includes('keep'));
    assert.strictEqual(new Set(n1.tags).size, n1.tags.length);
    assert.strictEqual(N.getNote('/2.wav').tags.join(','), 'keep');
  });

  it('deleteTag strips tag from all items and standalone list', async () => {
    vst.setStandaloneTags(['gone', 'stay']);
    await N.setNote('/z.wav', '', ['gone']);
    await N.deleteTag('gone');
    assert.strictEqual(N.getNote('/z.wav').tags.length, 0);
    assert.ok(!N.getStandaloneTags().includes('gone'));
    assert.ok(N.getStandaloneTags().includes('stay'));
  });

  it('addTagToItem does not duplicate an existing tag', async () => {
    await N.setNote('/dup.wav', 'x', ['a']);
    await N.addTagToItem('/dup.wav', 'a');
    assert.strictEqual(N.getNote('/dup.wav').tags.join(','), 'a');
  });

  it('removeTagFromItem returns early when path has no note', () => {
    assert.doesNotThrow(() => N.removeTagFromItem('/missing.wav', 't'));
  });

  it('setNote keeps entry when note is whitespace-only but tags are non-empty (note text stored verbatim)', async () => {
    await N.setNote('/ws.wav', '   ', ['only-tag']);
    const n = N.getNote('/ws.wav');
    assert.strictEqual(n.note, '   ');
    assert.strictEqual(n.tags.join(','), 'only-tag');
  });
});
