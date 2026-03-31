// ── Keyboard Shortcut Customization ──

const DEFAULT_SHORTCUTS = {
  'tab1': { key: '1', mod: true, label: 'Plugins tab' },
  'tab2': { key: '2', mod: true, label: 'Samples tab' },
  'tab3': { key: '3', mod: true, label: 'DAW Projects tab' },
  'tab4': { key: '4', mod: true, label: 'Presets tab' },
  'tab5': { key: '5', mod: true, label: 'Favorites tab' },
  'tab6': { key: '6', mod: true, label: 'Notes tab' },
  'tab7': { key: '7', mod: true, label: 'History tab' },
  'tab8': { key: '8', mod: true, label: 'Settings tab' },
  'search': { key: 'f', mod: true, label: 'Focus search' },
  'help': { key: '?', mod: false, label: 'Help overlay' },
  'playPause': { key: ' ', mod: false, label: 'Play / Pause' },
  'nextTrack': { key: 'ArrowRight', mod: true, label: 'Next track' },
  'prevTrack': { key: 'ArrowLeft', mod: true, label: 'Previous track' },
};

const TAB_MAP = ['plugins', 'samples', 'daw', 'presets', 'favorites', 'notes', 'history', 'settings'];

function getShortcuts() {
  const saved = prefs.getObject('customShortcuts', null);
  if (!saved) return { ...DEFAULT_SHORTCUTS };
  // Merge with defaults for new shortcuts
  const merged = { ...DEFAULT_SHORTCUTS };
  for (const [id, val] of Object.entries(saved)) {
    if (merged[id]) {
      merged[id] = { ...merged[id], key: val.key, mod: val.mod };
    }
  }
  return merged;
}

function saveShortcuts(shortcuts) {
  prefs.setItem('customShortcuts', shortcuts);
}

function resetShortcuts() {
  prefs.removeItem('customShortcuts');
  renderShortcutSettings();
  showToast('Shortcuts reset to defaults');
}

function formatKey(shortcut) {
  const isMac = navigator.platform.includes('Mac');
  let parts = [];
  if (shortcut.mod) parts.push(isMac ? '\u2318' : 'Ctrl');
  let k = shortcut.key;
  if (k === ' ') k = 'Space';
  else if (k === 'ArrowLeft') k = '\u2190';
  else if (k === 'ArrowRight') k = '\u2192';
  else if (k === 'ArrowUp') k = '\u2191';
  else if (k === 'ArrowDown') k = '\u2193';
  else if (k === 'Escape') k = 'Esc';
  else k = k.toUpperCase();
  parts.push(k);
  return parts.join('+');
}

function renderShortcutSettings() {
  const list = document.getElementById('shortcutsList');
  if (!list) return;
  const shortcuts = getShortcuts();
  list.innerHTML = Object.entries(shortcuts).map(([id, sc]) =>
    `<div class="shortcut-row">
      <span class="shortcut-name">${sc.label}</span>
      <span class="shortcut-key" data-shortcut-id="${id}" title="Click to rebind">${formatKey(sc)}</span>
    </div>`
  ).join('');
}

// Recording state
let _recordingId = null;

document.addEventListener('click', (e) => {
  const keyEl = e.target.closest('.shortcut-key');
  if (keyEl && keyEl.dataset.shortcutId) {
    // Start recording
    if (_recordingId) {
      // Cancel previous
      document.querySelectorAll('.shortcut-key.recording').forEach(el => el.classList.remove('recording'));
    }
    _recordingId = keyEl.dataset.shortcutId;
    keyEl.classList.add('recording');
    keyEl.textContent = 'Press key...';
    e.stopPropagation();
    return;
  }
  const resetBtn = e.target.closest('[data-action="resetShortcuts"]');
  if (resetBtn) {
    resetShortcuts();
  }
});

document.addEventListener('keydown', (e) => {
  if (_recordingId) {
    e.preventDefault();
    e.stopPropagation();
    const isMac = navigator.platform.includes('Mac');
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (e.key === 'Escape') {
      // Cancel recording
      _recordingId = null;
      renderShortcutSettings();
      return;
    }
    // Don't record bare modifier keys
    if (['Meta', 'Control', 'Shift', 'Alt'].includes(e.key)) return;

    const shortcuts = getShortcuts();
    shortcuts[_recordingId] = { ...shortcuts[_recordingId], key: e.key, mod };
    saveShortcuts(shortcuts);
    _recordingId = null;
    renderShortcutSettings();
    showToast('Shortcut updated');
    return;
  }

  // Don't handle shortcuts when typing in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.target.closest('.ctx-menu')) return;

  const isMac = navigator.platform.includes('Mac');
  const mod = isMac ? e.metaKey : e.ctrlKey;
  const shortcuts = getShortcuts();

  for (const [id, sc] of Object.entries(shortcuts)) {
    if (sc.key === e.key && sc.mod === mod) {
      e.preventDefault();
      executeShortcut(id);
      return;
    }
  }
}, true); // capture phase to override other handlers

function executeShortcut(id) {
  if (id.startsWith('tab') && id.length === 4) {
    const idx = parseInt(id[3]) - 1;
    if (idx >= 0 && idx < TAB_MAP.length) switchTab(TAB_MAP[idx]);
  } else if (id === 'search') {
    const activeTab = document.querySelector('.tab-content.active');
    const input = activeTab?.querySelector('input[type="text"]');
    if (input) { input.focus(); input.select(); }
  } else if (id === 'help') {
    toggleHelpOverlay();
  } else if (id === 'playPause') {
    toggleAudioPlayback();
  } else if (id === 'nextTrack') {
    nextTrack();
  } else if (id === 'prevTrack') {
    prevTrack();
  }
}
