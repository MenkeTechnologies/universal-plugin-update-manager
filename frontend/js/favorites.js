// ── Favorites ──
// Stored in prefs as an array of { type, path, name, ... }

function getFavorites() {
  return prefs.getObject('favorites', []);
}

function saveFavorites(favs) {
  prefs.setItem('favorites', favs);
}

function isFavorite(path) {
  return getFavorites().some(f => f.path === path);
}

function addFavorite(type, path, name, extra) {
  const favs = getFavorites();
  if (favs.some(f => f.path === path)) {
    showToast(`"${name}" is already in favorites`);
    return;
  }
  favs.unshift({ type, path, name, ...extra, addedAt: new Date().toISOString() });
  saveFavorites(favs);
  showToast(`Added "${name}" to favorites`);
}

function removeFavorite(path) {
  const favs = getFavorites().filter(f => f.path !== path);
  saveFavorites(favs);
  showToast('Removed from favorites');
  renderFavorites();
}

function clearFavorites() {
  if (!confirm('Remove all favorites?')) return;
  saveFavorites([]);
  showToast('All favorites cleared');
  renderFavorites();
}

function renderFavorites() {
  const list = document.getElementById('favList');
  const empty = document.getElementById('favEmptyState');
  if (!list) return;

  const favs = getFavorites();
  const search = (document.getElementById('favSearchInput')?.value || '').toLowerCase();
  const typeFilter = document.getElementById('favTypeFilter')?.value || 'all';

  const filtered = favs.filter(f => {
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    if (search && !f.name.toLowerCase().includes(search) && !f.path.toLowerCase().includes(search)) return false;
    return true;
  });

  if (filtered.length === 0) {
    list.innerHTML = '';
    if (empty) empty.style.display = '';
    if (favs.length > 0 && filtered.length === 0) {
      list.innerHTML = '<div class="state-message"><div class="state-icon">&#128269;</div><h2>No matching favorites</h2></div>';
      if (empty) empty.style.display = 'none';
    }
    return;
  }
  if (empty) empty.style.display = 'none';

  list.innerHTML = filtered.map(f => {
    const typeLabel = { plugin: 'Plugin', sample: 'Sample', daw: 'DAW Project', preset: 'Preset' }[f.type] || f.type;
    const typeClass = { plugin: 'type-vst3', sample: 'format-wav', daw: 'daw-ableton-live', preset: 'format-default' }[f.type] || 'format-default';
    const extra = f.format ? `<span class="format-badge format-default">${escapeHtml(f.format)}</span>` : '';
    const daw = f.daw ? `<span class="format-badge ${getDawBadgeClass ? getDawBadgeClass(f.daw) : 'format-default'}">${escapeHtml(f.daw)}</span>` : '';
    const hp = escapeHtml(f.path);
    const isPlaying = f.type === 'sample' && typeof audioPlayerPath !== 'undefined' && audioPlayerPath === f.path && typeof audioPlayer !== 'undefined' && !audioPlayer.paused;
    const playBtn = f.type === 'sample'
      ? `<button class="btn-small btn-play${isPlaying ? ' playing' : ''}" data-action="previewAudio" data-path="${hp}" title="Play">${isPlaying ? '&#9646;&#9646;' : '&#9654;'}</button>`
      : '';
    const loopBtn = f.type === 'sample'
      ? `<button class="btn-small btn-loop" data-action="toggleRowLoop" data-path="${hp}" title="Loop">&#8634;</button>`
      : '';
    const cursor = (f.type === 'sample' || f.type === 'daw') ? ' style="cursor:pointer;"' : '';
    return `<div class="fav-item" data-path="${hp}" data-type="${f.type}" data-name="${escapeHtml(f.name)}"${cursor}>
      <span class="fav-star">&#9733;</span>
      <span class="fav-type"><span class="format-badge ${typeClass}">${typeLabel}</span></span>
      <span class="fav-name" title="${hp}">${escapeHtml(f.name)}</span>
      ${extra}${daw}
      <span class="fav-actions">
        ${playBtn}${loopBtn}
        <button class="btn-small btn-folder" data-action="openFavFolder" data-path="${hp}" data-type="${f.type}" title="Reveal in Finder">&#128193;</button>
        <button class="btn-small btn-stop" data-action="removeFav" data-path="${hp}" title="Remove from favorites">&#10005;</button>
      </span>
    </div>`;
  }).join('');
}

// Wire up fav actions via delegation
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action="removeFav"]');
  if (el) {
    removeFavorite(el.dataset.path);
    return;
  }
  const folder = e.target.closest('[data-action="openFavFolder"]');
  if (folder) {
    const type = folder.dataset.type;
    const path = folder.dataset.path;
    if (type === 'plugin') openFolder(path);
    else if (type === 'sample') openAudioFolder(path);
    else if (type === 'daw') openDawFolder(path);
    else if (type === 'preset') openPresetFolder(path);
    return;
  }
  // Single click on sample favorite → play
  const favItem = e.target.closest('.fav-item[data-type="sample"]');
  if (favItem && !e.target.closest('.fav-actions') && !e.target.closest('button')) {
    const path = favItem.dataset.path;
    if (path && typeof previewAudio === 'function') previewAudio(path);
  }
});

// Double-click on DAW favorite → open in DAW, plugin → open KVR
document.addEventListener('dblclick', (e) => {
  const favItem = e.target.closest('.fav-item');
  if (!favItem || e.target.closest('.fav-actions') || e.target.closest('button')) return;
  const type = favItem.dataset.type;
  const path = favItem.dataset.path;
  const name = favItem.dataset.name || '';

  if (type === 'daw') {
    const daw = favItem.querySelector('.format-badge')?.textContent || 'DAW';
    showToast(`Opening "${name}" in ${daw}...`);
    window.vstUpdater.openDawProject(path).catch(err => showToast(`${daw} not installed — ${err}`, 4000, 'error'));
  } else if (type === 'plugin') {
    const plugin = typeof allPlugins !== 'undefined' && allPlugins.find(p => p.path === path);
    const kvrUrl = plugin ? (plugin.kvrUrl || buildKvrUrl(plugin.name, plugin.manufacturer)) : buildKvrUrl(name, '');
    window.vstUpdater.openUpdate(kvrUrl);
  } else if (type === 'preset') {
    if (typeof openPresetFolder === 'function') openPresetFolder(path);
  }
});
