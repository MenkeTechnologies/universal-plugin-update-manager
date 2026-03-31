// ── Keyboard Navigation ──
// Arrow keys, Enter, Space for navigating tables and plugin lists

let _navIndex = -1;
let _navTab = null;

function getNavigableItems() {
  const activeTab = document.querySelector('.tab-content.active');
  if (!activeTab) return [];
  const id = activeTab.id;
  if (id === 'tabPlugins') return [...activeTab.querySelectorAll('.plugin-card')];
  if (id === 'tabSamples') return [...activeTab.querySelectorAll('#audioTableBody tr[data-audio-path]')];
  if (id === 'tabDaw') return [...activeTab.querySelectorAll('#dawTableBody tr[data-daw-path]')];
  if (id === 'tabPresets') return [...activeTab.querySelectorAll('#presetTableBody tr[data-preset-path]')];
  if (id === 'tabFavorites') return [...activeTab.querySelectorAll('.fav-item')];
  return [];
}

function clearNavSelection() {
  document.querySelectorAll('.nav-selected').forEach(el => el.classList.remove('nav-selected'));
}

function setNavIndex(idx) {
  const items = getNavigableItems();
  if (items.length === 0) return;
  clearNavSelection();
  _navIndex = Math.max(0, Math.min(idx, items.length - 1));
  const item = items[_navIndex];
  item.classList.add('nav-selected');
  item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function activateNavItem() {
  const items = getNavigableItems();
  if (_navIndex < 0 || _navIndex >= items.length) return;
  const item = items[_navIndex];
  const activeTab = document.querySelector('.tab-content.active')?.id;

  if (activeTab === 'tabSamples') {
    const path = item.getAttribute('data-audio-path');
    if (path) previewAudio(path);
  } else if (activeTab === 'tabDaw') {
    const path = item.dataset.dawPath;
    if (path) {
      const name = item.querySelector('.col-name')?.textContent || '';
      const dawName = item.querySelector('.format-badge')?.textContent || 'DAW';
      showToast(`Opening "${name}" in ${dawName}...`);
      window.vstUpdater.openDawProject(path).catch(err => showToast(`${dawName} not installed — ${err}`, 4000, 'error'));
    }
  } else if (activeTab === 'tabPresets') {
    const path = item.dataset.presetPath;
    if (path) openPresetFolder(path);
  } else if (activeTab === 'tabPlugins') {
    const kvrBtn = item.querySelector('[data-action="openKvr"]');
    if (kvrBtn) openKvr(kvrBtn, kvrBtn.dataset.url, kvrBtn.dataset.name);
  }
}

document.addEventListener('keydown', (e) => {
  // Don't navigate when typing in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.target.closest('.ctx-menu')) return;

  const activeTab = document.querySelector('.tab-content.active')?.id;
  if (!activeTab) return;

  if (e.key === 'ArrowDown' || e.key === 'j') {
    e.preventDefault();
    setNavIndex(_navIndex + 1);
  } else if (e.key === 'ArrowUp' || e.key === 'k') {
    e.preventDefault();
    setNavIndex(_navIndex - 1);
  } else if (e.key === 'Home') {
    e.preventDefault();
    setNavIndex(0);
  } else if (e.key === 'End') {
    e.preventDefault();
    setNavIndex(getNavigableItems().length - 1);
  } else if (e.key === 'Enter') {
    if (_navIndex >= 0) { e.preventDefault(); activateNavItem(); }
  } else if (e.key === ' ' && activeTab === 'tabSamples') {
    if (_navIndex >= 0) { e.preventDefault(); activateNavItem(); }
  } else if (e.key === '?') {
    e.preventDefault();
    toggleHelpOverlay();
  }
});

// Reset nav index on tab switch
const _origSwitchTab = switchTab;
switchTab = function(tab) {
  _navIndex = -1;
  clearNavSelection();
  _origSwitchTab(tab);
};
