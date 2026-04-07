// ── Batch Selection ──
// Checkboxes in table rows for multi-item operations.
// Selections are scoped per inventory tab (tabSamples, tabDaw, …) — not one global Set.

/** Tab panel ids that use `.batch-cb` in a table body. */
const TABS_WITH_BATCH = new Set(['tabSamples', 'tabDaw', 'tabPresets', 'tabMidi', 'tabPdf']);

/** @type {Map<string, Set<string>>} */
const batchByTab = new Map();

function tabIdForBatchContext() {
    const tab = document.querySelector('.tab-content.active');
    return tab && TABS_WITH_BATCH.has(tab.id) ? tab.id : null;
}

/**
 * Paths selected on the given inventory tab (for row HTML `checked` state).
 * @param {string} tabId — e.g. `tabSamples`
 */
function batchSetForTabId(tabId) {
    if (!TABS_WITH_BATCH.has(tabId)) return new Set();
    if (!batchByTab.has(tabId)) batchByTab.set(tabId, new Set());
    return batchByTab.get(tabId);
}

/** Mutable Set for the active inventory tab, or null if the active tab has no batch UI. */
function getActiveBatchSet() {
    const id = tabIdForBatchContext();
    if (!id) return null;
    return batchSetForTabId(id);
}

function activeBatchCount() {
    const s = getActiveBatchSet();
    return s ? s.size : 0;
}

function getPathFromBatchRow(el) {
    if (!el) return null;
    return (
        el.dataset.audioPath ||
        el.dataset.dawPath ||
        el.dataset.presetPath ||
        el.dataset.midiPath ||
        el.dataset.pdfPath ||
        el.dataset.path ||
        null
    );
}

function rowElementFromBatchCheckbox(cb) {
    return cb.closest('tr') || cb.closest('.plugin-card') || cb.closest('.fav-item');
}

function toggleBatchSelect(path, checked) {
    const set = getActiveBatchSet();
    if (!set) return;
    if (checked) {
        set.add(path);
    } else {
        set.delete(path);
    }
    updateBatchBar();
}

function selectAllVisible() {
    const id = tabIdForBatchContext();
    if (!id) return;
    const tbody = document.querySelector('.tab-content.active tbody');
    if (!tbody) return;
    const set = batchSetForTabId(id);
    tbody.querySelectorAll('.batch-cb').forEach(cb => {
        cb.checked = true;
        const path = getPathFromBatchRow(rowElementFromBatchCheckbox(cb));
        if (path) set.add(path);
    });
    updateBatchBar();
}

function deselectAll() {
    batchByTab.clear();
    document.querySelectorAll('.batch-cb').forEach(cb => {
        cb.checked = false;
    });
    document.querySelectorAll('.batch-cb-all').forEach(cb => {
        cb.checked = false;
    });
    updateBatchBar();
}

function updateBatchBar() {
    const bar = document.getElementById('batchActionBar');
    if (!bar) return;
    const n = activeBatchCount();
    if (n === 0) {
        bar.style.display = 'none';
        document.querySelectorAll('.batch-cb-all').forEach(cb => {
            cb.checked = false;
        });
        return;
    }
    bar.style.display = 'flex';
    const bc = document.getElementById('batchSelectionCount');
    if (bc) {
        bc.textContent = catalogFmt('menu.batch_selected', {n});
    }

    const tbody = document.querySelector('.tab-content.active tbody');
    if (tbody) {
        const allCbs = tbody.querySelectorAll('.batch-cb');
        const allChecked = allCbs.length > 0 && [...allCbs].every(cb => cb.checked);
        const headerCb = tbody.closest('table')?.querySelector('.batch-cb-all');
        if (headerCb) headerCb.checked = allChecked;
    }
}

function batchFavoriteAll() {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;
    const set = getActiveBatchSet();
    if (!set || set.size === 0) return;

    let type = 'sample',
        items = typeof allAudioSamples !== 'undefined' ? allAudioSamples : [];
    if (activeTab.id === 'tabPlugins') {
        type = 'plugin';
        items = typeof allPlugins !== 'undefined' ? allPlugins : [];
    } else if (activeTab.id === 'tabDaw') {
        type = 'daw';
        items = typeof allDawProjects !== 'undefined' ? allDawProjects : [];
    } else if (activeTab.id === 'tabPresets') {
        type = 'preset';
        items = typeof allPresets !== 'undefined' ? allPresets : [];
    } else if (activeTab.id === 'tabMidi') {
        type = 'midi';
        items = typeof allMidiFiles !== 'undefined' ? allMidiFiles : [];
    } else if (activeTab.id === 'tabPdf') {
        type = 'pdf';
        items = typeof allPdfs !== 'undefined' ? allPdfs : [];
    }

    let added = 0;
    for (const path of set) {
        if (isFavorite(path)) continue;
        const item = typeof findByPath === 'function' ? findByPath(items, path) : items.find(i => i.path === path);
        if (item) {
            if (type === 'plugin') {
                addFavorite(type, path, item.name, {format: item.type || item.format || ''});
            } else {
                addFavorite(type, path, item.name, {format: item.format, daw: item.daw});
            }
            added++;
        }
    }
    showToast(toastFmt('toast.added_favorites_batch', {n: added}));
    deselectAll();
}

function batchCopyPaths() {
    const set = getActiveBatchSet();
    if (!set || set.size === 0) return;
    const paths = [...set].join('\n');
    if (typeof copyToClipboard !== 'function') return;
    copyToClipboard(paths);
    showToast(toastFmt('toast.copied_n_paths', {n: set.size}));
}

function batchExportSelected() {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;
    const set = getActiveBatchSet();
    if (!set || set.size === 0) return;

    const pickByPaths = (arr) => {
        const out = [];
        for (const path of set) {
            const item = findByPath(arr, path);
            if (item) out.push(item);
        }
        return out;
    };
    let items = [];
    if (activeTab.id === 'tabPlugins') {
        items = pickByPaths(typeof allPlugins !== 'undefined' ? allPlugins : []);
    } else if (activeTab.id === 'tabSamples') {
        items = pickByPaths(allAudioSamples);
    } else if (activeTab.id === 'tabDaw') {
        items = pickByPaths(allDawProjects);
    } else if (activeTab.id === 'tabPresets') {
        items = pickByPaths(allPresets);
    } else if (activeTab.id === 'tabMidi') {
        items = pickByPaths(typeof allMidiFiles !== 'undefined' ? allMidiFiles : []);
    } else if (activeTab.id === 'tabPdf') {
        items = pickByPaths(typeof allPdfs !== 'undefined' ? allPdfs : []);
    }

    if (items.length === 0) return;
    if (typeof copyToClipboard !== 'function') return;
    copyToClipboard(JSON.stringify(items, null, 2));
    showToast(toastFmt('toast.copied_n_json', {n: items.length}));
}

function batchRevealAll() {
    const activeTab = document.querySelector('.tab-content.active');
    const set = getActiveBatchSet();
    if (!activeTab || !set || set.size === 0) return;
    const path = [...set][0];
    if (activeTab.id === 'tabSamples') {
        if (typeof openAudioFolder === 'function') openAudioFolder(path);
    } else if (activeTab.id === 'tabDaw') {
        if (typeof openDawFolder === 'function') openDawFolder(path);
    } else if (activeTab.id === 'tabPresets') {
        if (typeof openPresetFolder === 'function') openPresetFolder(path);
    } else if (activeTab.id === 'tabPlugins') {
        if (typeof window !== 'undefined' && window.vstUpdater && typeof window.vstUpdater.openPluginFolder === 'function') {
            window.vstUpdater.openPluginFolder(path).catch(e => showToast(toastFmt('toast.failed', {err: e}), 4000, 'error'));
        }
    } else if (activeTab.id === 'tabMidi' || activeTab.id === 'tabPdf') {
        if (typeof openAudioFolder === 'function') openAudioFolder(path);
    }
    showToast(toastFmt('toast.revealing_first_batch', {n: set.size}));
}

// Wire up checkbox changes and batch action buttons
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('batch-cb')) {
        const path = getPathFromBatchRow(rowElementFromBatchCheckbox(e.target));
        if (path) toggleBatchSelect(path, e.target.checked);
    }
});

document.addEventListener('click', (e) => {
    // Header "select all" checkbox — must check before batch-cb
    if (e.target.classList.contains('batch-cb-all')) {
        e.stopPropagation();
        if (e.target.checked) selectAllVisible();
        else deselectAll();
        return;
    }

    // Prevent row click-through on checkbox cell
    if (e.target.classList.contains('batch-cb')) {
        e.stopPropagation();
        return;
    }

    const action = e.target.closest('[data-batch-action]');
    if (action) {
        const act = action.dataset.batchAction;
        if (act === 'selectAll') selectAllVisible();
        else if (act === 'deselectAll') deselectAll();
        else if (act === 'favorite') batchFavoriteAll();
        else if (act === 'copyPaths') batchCopyPaths();
        else if (act === 'exportJson') batchExportSelected();
        else if (act === 'reveal') batchRevealAll();
    }
});

if (typeof window !== 'undefined') {
    window.batchSetForTabId = batchSetForTabId;
    window.getActiveBatchSet = getActiveBatchSet;
    window.activeBatchCount = activeBatchCount;
}
