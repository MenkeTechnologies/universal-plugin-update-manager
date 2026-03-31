// ── Notes & Tags ──
// Store notes and tags on any item, persisted in prefs

function getNotes() {
  return prefs.getObject('itemNotes', {});
}

function getNote(path) {
  return getNotes()[path] || null;
}

function setNote(path, note, tags) {
  const notes = getNotes();
  if ((!note || !note.trim()) && (!tags || tags.length === 0)) {
    delete notes[path];
  } else {
    notes[path] = { note: note || '', tags: tags || [], updatedAt: new Date().toISOString() };
  }
  prefs.setItem('itemNotes', notes);
}

function getAllTags() {
  const notes = getNotes();
  const tags = new Set();
  for (const entry of Object.values(notes)) {
    if (entry.tags) entry.tags.forEach(t => tags.add(t));
  }
  return [...tags].sort();
}

function showNoteEditor(path, name) {
  let existing = document.getElementById('noteModal');
  if (existing) existing.remove();

  const current = getNote(path);
  const noteText = current?.note || '';
  const tags = current?.tags?.join(', ') || '';

  const html = `<div class="modal-overlay" id="noteModal">
    <div class="modal-content modal-small">
      <div class="modal-header">
        <h2>Notes: ${escapeHtml(name)}</h2>
        <button class="modal-close" onclick="document.getElementById('noteModal').remove()">&#10005;</button>
      </div>
      <div class="modal-body">
        <label class="note-label">Note</label>
        <textarea class="note-textarea" id="noteText" rows="4" placeholder="Add a note...">${escapeHtml(noteText)}</textarea>
        <label class="note-label">Tags <span style="color: var(--text-muted); font-weight: 400;">(comma-separated)</span></label>
        <input type="text" class="note-input" id="noteTags" placeholder="kick, bass, favorite" value="${escapeHtml(tags)}">
        <div class="note-actions">
          <button class="btn btn-primary" onclick="saveNoteFromModal('${escapePath(path)}')">Save</button>
          <button class="btn btn-secondary" onclick="document.getElementById('noteModal').remove()">Cancel</button>
          ${current ? '<button class="btn btn-stop" onclick="deleteNoteFromModal(\'' + escapePath(path) + '\')">Delete Note</button>' : ''}
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('noteText').focus();
}

function saveNoteFromModal(path) {
  const note = document.getElementById('noteText').value;
  const tagsStr = document.getElementById('noteTags').value;
  const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
  setNote(path, note, tags);
  document.getElementById('noteModal').remove();
  showToast('Note saved');
}

function deleteNoteFromModal(path) {
  setNote(path, '', []);
  document.getElementById('noteModal').remove();
  showToast('Note deleted');
}

// Get note indicator HTML for a row
function noteIndicator(path) {
  const note = getNote(path);
  if (!note) return '';
  const tagHtml = note.tags?.length ? ` [${note.tags.join(', ')}]` : '';
  return `<span class="note-icon" title="${escapeHtml(note.note + tagHtml)}">&#128221;</span>`;
}
