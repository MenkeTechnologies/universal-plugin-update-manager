// ── Sort State Persistence ──
// Saves and restores the last-used sort column and direction per tab

function saveSortState(tab, key, asc) {
  prefs.setItem(`sort_${tab}`, JSON.stringify({ key, asc }));
}

function restoreSortState(tab) {
  const saved = prefs.getItem(`sort_${tab}`);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch { return null; }
}

// Patch sort functions to persist state
const _origSortAudio = typeof sortAudio === 'function' ? sortAudio : null;
const _origSortDaw = typeof sortDaw === 'function' ? sortDaw : null;
const _origSortPreset = typeof sortPreset === 'function' ? sortPreset : null;

if (_origSortAudio) {
  const _realSortAudio = sortAudio;
  // Can't reassign function declarations, so we hook via the action handler
}

// Restore sort states on startup
function restoreAllSortStates() {
  const audio = restoreSortState('audio');
  if (audio && typeof audioSortKey !== 'undefined') {
    audioSortKey = audio.key;
    audioSortAsc = audio.asc;
  }
  const daw = restoreSortState('daw');
  if (daw && typeof dawSortKey !== 'undefined') {
    dawSortKey = daw.key;
    dawSortAsc = daw.asc;
  }
  const preset = restoreSortState('preset');
  if (preset && typeof presetSortKey !== 'undefined') {
    presetSortKey = preset.key;
    presetSortAsc = preset.asc;
  }
}

// Hook into sort calls - save after each sort
function hookSortPersistence() {
  // Observe sort arrow updates to detect sort changes
  const observer = new MutationObserver(() => {
    // Check if sort states changed and save
    if (typeof audioSortKey !== 'undefined') saveSortState('audio', audioSortKey, audioSortAsc);
    if (typeof dawSortKey !== 'undefined') saveSortState('daw', dawSortKey, dawSortAsc);
    if (typeof presetSortKey !== 'undefined') saveSortState('preset', presetSortKey, presetSortAsc);
  });

  // Watch for sort arrow text changes
  document.querySelectorAll('.sort-arrow').forEach(el => {
    observer.observe(el, { childList: true, characterData: true, subtree: true });
  });
}

// Init on DOM ready - called from app.js
function initSortPersistence() {
  restoreAllSortStates();
  // Delay hook to allow tables to init
  setTimeout(hookSortPersistence, 1000);
}
