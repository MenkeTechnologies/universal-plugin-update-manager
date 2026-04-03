const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Pure logic from frontend/js/notes.js (no prefs/DOM) ──

function getAllTagsFromStore(notes, standaloneTags) {
  const tags = new Set(standaloneTags || []);
  for (const entry of Object.values(notes)) {
    if (entry.tags) entry.tags.forEach(t => tags.add(t));
  }
  return [...tags].sort();
}

function getTagCountsFromStore(notes, standaloneTags) {
  const counts = {};
  for (const t of standaloneTags || []) counts[t] = 0;
  for (const entry of Object.values(notes)) {
    if (entry.tags) {
      entry.tags.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    }
  }
  return counts;
}

function getItemsWithTagFromStore(notes, tag) {
  return Object.entries(notes)
    .filter(([, n]) => n.tags && n.tags.includes(tag))
    .map(([path, n]) => ({ path, ...n }));
}

function hasTagInStore(notes, path, tag) {
  const note = notes[path];
  return note?.tags?.includes(tag) || false;
}

function shouldDeleteNoteContent(noteText, tags) {
  return (!noteText || !noteText.trim()) && (!tags || tags.length === 0);
}

function renameTagInNotes(notes, oldTag, newTag) {
  const out = JSON.parse(JSON.stringify(notes));
  let changed = 0;
  for (const n of Object.values(out)) {
    if (n.tags && n.tags.includes(oldTag)) {
      n.tags = n.tags.map(t => (t === oldTag ? newTag : t));
      n.tags = [...new Set(n.tags)];
      changed++;
    }
  }
  return { notes: out, changed };
}

function deleteTagFromNotes(notes, tag) {
  const out = JSON.parse(JSON.stringify(notes));
  let changed = 0;
  for (const n of Object.values(out)) {
    if (n.tags && n.tags.includes(tag)) {
      n.tags = n.tags.filter(t => t !== tag);
      changed++;
    }
  }
  return { notes: out, changed };
}

describe('getAllTagsFromStore', () => {
  it('merges standalone and note tags', () => {
    const notes = {
      '/a': { tags: ['drums', 'kick'] },
      '/b': { tags: ['drums', 'snare'] },
    };
    const all = getAllTagsFromStore(notes, ['vocal']);
    assert.deepStrictEqual(all, ['drums', 'kick', 'snare', 'vocal']);
  });

  it('dedupes across notes', () => {
    const notes = { '/a': { tags: ['x'] }, '/b': { tags: ['x'] } };
    assert.deepStrictEqual(getAllTagsFromStore(notes, []), ['x']);
  });

  it('empty notes', () => {
    assert.deepStrictEqual(getAllTagsFromStore({}, ['only']), ['only']);
  });
});

describe('getTagCountsFromStore', () => {
  it('counts per tag', () => {
    const notes = {
      '/a': { tags: ['t', 'u'] },
      '/b': { tags: ['t'] },
    };
    const c = getTagCountsFromStore(notes, ['orphan']);
    assert.strictEqual(c.t, 2);
    assert.strictEqual(c.u, 1);
    assert.strictEqual(c.orphan, 0);
  });
});

describe('getItemsWithTagFromStore', () => {
  it('returns paths with tag', () => {
    const notes = { '/x': { tags: ['a'] }, '/y': { tags: ['b'] } };
    const items = getItemsWithTagFromStore(notes, 'a');
    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0].path, '/x');
  });
});

describe('hasTagInStore', () => {
  it('false when no note', () => {
    assert.strictEqual(hasTagInStore({}, '/p', 't'), false);
  });

  it('true when tag present', () => {
    assert.strictEqual(hasTagInStore({ '/p': { tags: ['x'] } }, '/p', 'x'), true);
  });
});

describe('shouldDeleteNoteContent', () => {
  it('true when empty note and no tags', () => {
    assert.strictEqual(shouldDeleteNoteContent('', []), true);
    assert.strictEqual(shouldDeleteNoteContent('   ', null), true);
  });

  it('false when tags remain', () => {
    assert.strictEqual(shouldDeleteNoteContent('', ['a']), false);
  });

  it('false when note text', () => {
    assert.strictEqual(shouldDeleteNoteContent('hello', []), false);
  });
});

describe('renameTagInNotes', () => {
  it('replaces tag and dedupes', () => {
    const notes = {
      '/1': { tags: ['old', 'keep'] },
      '/2': { tags: ['old'] },
    };
    const { notes: next, changed } = renameTagInNotes(notes, 'old', 'new');
    assert.strictEqual(changed, 2);
    assert.deepStrictEqual(next['/1'].tags.sort(), ['keep', 'new'].sort());
    assert.deepStrictEqual(next['/2'].tags, ['new']);
  });
});

describe('deleteTagFromNotes', () => {
  it('removes tag from all', () => {
    const notes = { '/a': { tags: ['x', 'y'] } };
    const { notes: next, changed } = deleteTagFromNotes(notes, 'x');
    assert.strictEqual(changed, 1);
    assert.deepStrictEqual(next['/a'].tags, ['y']);
  });

  it('does not mutate input', () => {
    const notes = { '/a': { tags: ['z'] } };
    deleteTagFromNotes(notes, 'z');
    assert.deepStrictEqual(notes['/a'].tags, ['z']);
  });
});
