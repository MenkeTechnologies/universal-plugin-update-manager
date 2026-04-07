// ── Native OS drag-out (tauri-plugin-drag): drop files onto DAW, Finder, Desktop ──
// Single implementation for all tabs — pointer threshold avoids accidental drags vs clicks.

const _NATIVE_DRAG_ICON_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const _NATIVE_DRAG_THRESHOLD_SQ = 8 * 8;
let _nativeDragPointer = null;

function pathsWithBatch(primaryPath) {
  if (typeof batchSelected !== 'undefined' && batchSelected.size > 0 && batchSelected.has(primaryPath)) {
    return [...batchSelected];
  }
  return [primaryPath];
}

/**
 * Resolve absolute file path(s) to drag from a pointer event target, or null.
 */
function resolveNativeDragPathsFromTarget(t) {
  if (!t || typeof t.closest !== 'function') return null;

  const simPanel = document.getElementById('similarPanel');
  if (simPanel && simPanel.contains(t)) {
    const row = t.closest('[data-similar-path]');
    if (row && row.dataset.similarPath) return { paths: [row.dataset.similarPath] };
  }

  const activeTab = document.querySelector('.tab-content.active');
  if (!activeTab) return null;
  const id = activeTab.id;

  if (id === 'tabSamples') {
    const tr = t.closest('#audioTableBody tr[data-audio-path]');
    if (!tr || tr.id === 'audioLoadMore' || t.closest('[data-action-stop]')) return null;
    const p = tr.dataset.audioPath;
    return p ? { paths: pathsWithBatch(p) } : null;
  }

  if (id === 'tabDaw') {
    const tr = t.closest('#dawTableBody tr[data-daw-path]');
    if (!tr || t.closest('[data-action-stop]')) return null;
    const p = tr.dataset.dawPath;
    return p ? { paths: pathsWithBatch(p) } : null;
  }

  if (id === 'tabPresets') {
    const tr = t.closest('#presetTableBody tr[data-preset-path]');
    if (!tr || t.closest('[data-action-stop]')) return null;
    const p = tr.dataset.presetPath;
    return p ? { paths: pathsWithBatch(p) } : null;
  }

  if (id === 'tabMidi') {
    const tr = t.closest('#midiTableBody tr[data-midi-path]');
    if (!tr || t.closest('[data-action-stop]')) return null;
    const p = tr.dataset.midiPath;
    return p ? { paths: pathsWithBatch(p) } : null;
  }

  if (id === 'tabPdf') {
    const tr = t.closest('#pdfTableBody tr[data-pdf-path]');
    if (!tr || t.closest('[data-action-stop]')) return null;
    const p = tr.dataset.pdfPath;
    return p ? { paths: pathsWithBatch(p) } : null;
  }

  if (id === 'tabPlugins') {
    const card = t.closest('#pluginList .plugin-card[data-path]');
    if (!card || t.closest('.plugin-actions')) return null;
    const p = card.dataset.path;
    return p ? { paths: [p] } : null;
  }

  if (id === 'tabFavorites') {
    const item = t.closest('#favList .fav-item[data-path]');
    if (!item || t.closest('.fav-actions')) return null;
    const p = item.dataset.path;
    return p ? { paths: [p] } : null;
  }

  if (id === 'tabNotes') {
    const card = t.closest('#notesList .note-card[data-path]');
    if (!card || t.closest('[data-action-stop]')) return null;
    const p = card.dataset.path;
    return p ? { paths: [p] } : null;
  }

  if (id === 'tabFiles') {
    const row = t.closest('#fileList .file-row[data-file-path]');
    if (!row || t.closest('.fb-meta-panel')) return null;
    const p = row.dataset.filePath;
    return p ? { paths: [p] } : null;
  }

  return null;
}

async function startNativeFileDrag(filePaths) {
  const tauri = typeof window !== 'undefined' ? window.__TAURI__ : null;
  if (!tauri || typeof tauri.drag?.startDrag !== 'function') return;
  const paths = filePaths.filter(Boolean);
  if (paths.length === 0) return;
  try {
    await tauri.drag.startDrag({
      item: paths,
      icon: _NATIVE_DRAG_ICON_PNG,
      mode: 'copy',
    });
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast(String(err && err.message ? err.message : err), 4000, 'error');
    }
  }
}

function initNativeFileDrag() {
  if (typeof document === 'undefined' || initNativeFileDrag._done) return;
  initNativeFileDrag._done = true;

  document.addEventListener('click', (e) => {
    if (typeof window === 'undefined' || !window.__suppressNextDelegatedClick) return;
    window.__suppressNextDelegatedClick = false;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);

  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const resolved = resolveNativeDragPathsFromTarget(e.target);
    if (!resolved || !resolved.paths.length) return;
    _nativeDragPointer = {
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      didDrag: false,
      paths: resolved.paths,
    };
  }, true);

  document.addEventListener('pointermove', (e) => {
    if (!_nativeDragPointer || e.pointerId !== _nativeDragPointer.pointerId) return;
    const d = _nativeDragPointer;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (dx * dx + dy * dy < _NATIVE_DRAG_THRESHOLD_SQ) return;
    if (d.didDrag) return;
    d.didDrag = true;
    e.preventDefault();
    void startNativeFileDrag(d.paths);
  }, true);

  document.addEventListener('pointerup', (e) => {
    if (!_nativeDragPointer || e.pointerId !== _nativeDragPointer.pointerId) return;
    const d = _nativeDragPointer;
    _nativeDragPointer = null;
    if (d.didDrag && typeof window !== 'undefined') {
      window.__suppressNextDelegatedClick = true;
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.__suppressNextDelegatedClick) {
          window.__suppressNextDelegatedClick = false;
        }
      }, 500);
    }
  }, true);

  document.addEventListener('pointercancel', (e) => {
    if (_nativeDragPointer && e.pointerId === _nativeDragPointer.pointerId) {
      _nativeDragPointer = null;
    }
  }, true);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initNativeFileDrag());
  } else {
    initNativeFileDrag();
  }
}
