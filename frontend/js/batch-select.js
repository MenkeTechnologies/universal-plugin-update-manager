// ── Batch Selection ──
// Adds checkboxes to table rows for multi-item operations

const batchSelected = new Set();

function toggleBatchSelect(path, checkbox) {
  if (checkbox.checked) {
    batchSelected.add(path);
  } else {
    batchSelected.delete(path);
  }
  updateBatchBar();
}

function selectAllVisible(tableBodyId) {
  const tbody = document.getElementById(tableBodyId);
  if (!tbody) return;
  tbody.querySelectorAll('.batch-cb').forEach(cb => {
    cb.checked = true;
    const path = cb.closest('tr')?.dataset.audioPath || cb.closest('tr')?.dataset.dawPath || cb.closest('tr')?.dataset.presetPath;
    if (path) batchSelected.add(path);
  });
  updateBatchBar();
}

function deselectAll() {
  batchSelected.clear();
  document.querySelectorAll('.batch-cb').forEach(cb => { cb.checked = false; });
  updateBatchBar();
}

function updateBatchBar() {
  const bar = document.getElementById('batchActionBar');
  if (!bar) return;
  if (batchSelected.size === 0) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';
  document.getElementById('batchCount').textContent = `${batchSelected.size} selected`;
}

function batchFavoriteAll() {
  const activeTab = document.querySelector('.tab-content.active');
  if (!activeTab) return;
  let type = 'sample';
  if (activeTab.id === 'tabDaw') type = 'daw';
  else if (activeTab.id === 'tabPresets') type = 'preset';

  for (const path of batchSelected) {
    if (isFavorite(path)) continue;
    let item;
    if (type === 'sample') item = allAudioSamples.find(s => s.path === path);
    else if (type === 'daw') item = allDawProjects.find(p => p.path === path);
    else if (type === 'preset') item = allPresets.find(p => p.path === path);
    if (item) {
      addFavorite(type, path, item.name, { format: item.format, daw: item.daw });
    }
  }
  showToast(`Added ${batchSelected.size} items to favorites`);
  deselectAll();
}

function batchCopyPaths() {
  const paths = [...batchSelected].join('\n');
  copyToClipboard(paths);
  showToast(`Copied ${batchSelected.size} paths`);
}

function batchExportSelected() {
  const activeTab = document.querySelector('.tab-content.active');
  if (!activeTab) return;

  let items = [];
  if (activeTab.id === 'tabSamples') {
    items = allAudioSamples.filter(s => batchSelected.has(s.path));
  } else if (activeTab.id === 'tabDaw') {
    items = allDawProjects.filter(p => batchSelected.has(p.path));
  } else if (activeTab.id === 'tabPresets') {
    items = allPresets.filter(p => batchSelected.has(p.path));
  }

  if (items.length === 0) return;
  copyToClipboard(JSON.stringify(items, null, 2));
  showToast(`Copied ${items.length} items as JSON`);
}

// Wire up batch action buttons via delegation
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('batch-cb')) {
    const path = e.target.closest('tr')?.dataset.audioPath || e.target.closest('tr')?.dataset.dawPath || e.target.closest('tr')?.dataset.presetPath;
    if (path) toggleBatchSelect(path, e.target);
    e.stopPropagation();
    return;
  }
  const action = e.target.closest('[data-batch-action]');
  if (action) {
    const act = action.dataset.batchAction;
    if (act === 'selectAll') {
      const tbody = document.querySelector('.tab-content.active tbody');
      if (tbody) selectAllVisible(tbody.id);
    } else if (act === 'deselectAll') deselectAll();
    else if (act === 'favorite') batchFavoriteAll();
    else if (act === 'copyPaths') batchCopyPaths();
    else if (act === 'exportJson') batchExportSelected();
  }
});
