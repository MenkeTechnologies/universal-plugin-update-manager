// ── Video files tab ── Paginated SQLite queries (same UX model as PDF tab).

function _videoFmt(key, vars) {
    if (typeof appFmt !== 'function') return key;
    return vars ? appFmt(key, vars) : appFmt(key);
}

let allVideos = [];
let filteredVideos = [];
let videoSortKey = 'name';
let videoSortAsc = true;
let videoScanProgressCleanup = null;
let _videoScanDbView = false;
let videoRenderCount = 0;
let _videoOffset = 0;
let _videoTotalCount = 0;
let _videoTotalCountCapped = false;
let _videoTotalUnfiltered = 0;
let _videoQuerySeq = 0;
let _lastVideoSearch = '';
let _lastVideoMode = 'fuzzy';
let _videoLoaded = false;

function ensureVideoTableForQuery() {
    if (document.getElementById('videoTable')) return;
    const tableWrap = document.getElementById('videoTableWrap');
    if (!tableWrap) return;
    tableWrap.innerHTML = buildVideoTableHtml();
    if (typeof initColumnResize === 'function') initColumnResize(document.getElementById('videoTable'));
    if (typeof initTableColumnReorder === 'function') initTableColumnReorder('videoTable', 'videoColumnOrder');
}

function showVideoQueryLoading(isLoadMore) {
    ensureVideoTableForQuery();
    showTableQueryLoadingRow({
        tbodyId: 'videoTableBody',
        rowId: 'videoQueryLoadingRow',
        tableId: 'videoTable',
        colspan: 7,
        append: isLoadMore,
        label: typeof queryLoadingLabel === 'function' ? queryLoadingLabel() : 'Loading…',
    });
}

async function fetchVideoPage() {
    const search = _lastVideoSearch || '';
    const seq = ++_videoQuerySeq;
    const isLoadMore = _videoOffset > 0;
    showVideoQueryLoading(isLoadMore);
    if (typeof setFilterFieldLoading === 'function') setFilterFieldLoading('videoSearchInput', true);
    if (typeof yieldForFilterFieldPaint === 'function') await yieldForFilterFieldPaint();
    else await new Promise((r) => requestAnimationFrame(r));
    try {
        const result = await window.vstUpdater.dbQueryVideo({
            search: search || null,
            format_filter: null,
            sort_key: videoSortKey,
            sort_asc: videoSortAsc,
            search_regex: _lastVideoMode === 'regex',
            offset: _videoOffset,
            limit: VIDEO_PAGE_SIZE,
        });
        if (seq !== _videoQuerySeq) return;
        let files = result.videoFiles || [];
        if (search && files.length > 1 && typeof searchScore === 'function') {
            const scored = files.map((v) => ({v, score: searchScore(search, [v.name, v.directory || ''], _lastVideoMode)}));
            scored.sort((a, b) => b.score - a.score);
            files = scored.map((x) => x.v);
        }
        filteredVideos = files;
        _videoTotalCount = result.totalCount || 0;
        _videoTotalCountCapped = result.totalCountCapped === true;
        _videoTotalUnfiltered = result.totalUnfiltered || 0;
        if (typeof yieldToBrowser === 'function') await yieldToBrowser();
        if (seq !== _videoQuerySeq) return;
        renderVideoTable();
        if (videoScanProgressCleanup) _videoScanDbView = true;
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(() => {
                void rebuildVideoStats();
            });
        } else {
            setTimeout(() => {
                void rebuildVideoStats();
            }, 0);
        }
    } catch (e) {
        if (seq !== _videoQuerySeq) return;
        clearTableQueryLoadingRow('videoQueryLoadingRow', 'videoTable');
        if (typeof showToast === 'function') {
            showToast(toastFmt('toast.video_query_failed', {err: e && e.message ? e.message : e}), 4000, 'error');
        }
    } finally {
        if (seq === _videoQuerySeq && typeof setFilterFieldLoading === 'function') setFilterFieldLoading('videoSearchInput', false);
    }
}

let _lastVideoAggKey = null;
let _videoAggCache = null;

async function rebuildVideoStats(force) {
    const statsEl = document.getElementById('videoStats');
    if (!statsEl) return;
    const search = document.getElementById('videoSearchInput')?.value || '';
    const regexOn = typeof getSearchMode === 'function' && getSearchMode('regexVideo') === 'regex';
    const key = search.trim() + '|' + (regexOn ? 'r' : 'f');
    let displayCount = 0;
    let displayBytes = 0;
    let unfiltered = 0;
    {
        const cacheHit = !force && key === _lastVideoAggKey && _videoAggCache;
        try {
            let agg;
            if (cacheHit) {
                agg = _videoAggCache;
            } else {
                agg = await window.vstUpdater.dbVideoFilterStats(search.trim(), null, regexOn);
                if (typeof yieldToBrowser === 'function') await yieldToBrowser();
                _lastVideoAggKey = key;
                _videoAggCache = agg;
            }
            displayCount = agg.count || 0;
            displayBytes = agg.totalBytes || 0;
            unfiltered = agg.totalUnfiltered || 0;
            _videoTotalCount = displayCount;
            _videoTotalCountCapped = agg.countCapped === true;
            _videoTotalUnfiltered = unfiltered;
        } catch {
            displayCount = allVideos.length;
            displayBytes = 0;
            unfiltered = allVideos.length;
        }
    }
    const isFiltered = search.trim() && displayCount < unfiltered;
    statsEl.style.display = (displayCount > 0 || unfiltered > 0) ? 'flex' : 'none';
    const dcPart = _videoTotalCountCapped ? displayCount.toLocaleString() + '+' : displayCount.toLocaleString();
    const countStr = isFiltered
        ? dcPart + ' / ' + unfiltered.toLocaleString()
        : (_videoTotalCountCapped ? displayCount.toLocaleString() + '+' : (unfiltered || displayCount).toLocaleString());
    const countEl = document.getElementById('videoCount');
    if (countEl) countEl.textContent = countStr;
    const sizeEl = document.getElementById('videoTotalSize');
    if (sizeEl) sizeEl.textContent = formatAudioSize(displayBytes);
    const u = unfiltered || displayCount || 0;
    if (typeof applyInventoryCountsPartial === 'function') applyInventoryCountsPartial({video: u});
    else {
        const headerEl = document.getElementById('videoCountHeader');
        if (headerEl) headerEl.textContent = u.toLocaleString();
    }
}

function buildVideoRow(v) {
    const hp = escapeHtml(v.path);
    const checked =
        typeof batchSetForTabId === 'function' && batchSetForTabId('tabVideos').has(v.path) ? ' checked' : '';
    const rowTt = typeof escapeHtml === 'function'
        ? escapeHtml(_videoFmt('ui.tt.video_row_double_click_open'))
        : _videoFmt('ui.tt.video_row_double_click_open');
    return `<tr data-video-path="${hp}" data-video-name="${escapeHtml((v.name || '').toLowerCase())}" style="cursor: pointer;" title="${rowTt}">
    <td class="col-cb" data-action-stop><input type="checkbox" class="batch-cb"${checked}></td>
    <td class="col-name" title="${escapeHtml(v.name)}">${_lastVideoSearch ? highlightMatch(v.name, _lastVideoSearch, _lastVideoMode) : escapeHtml(v.name)}${typeof rowBadges === 'function' ? rowBadges(v.path) : ''}</td>
    <td class="col-path" title="${hp}">${_lastVideoSearch ? highlightMatch(v.directory, _lastVideoSearch, _lastVideoMode) : escapeHtml(v.directory)}</td>
    <td class="col-format">${escapeHtml(v.format || '')}</td>
    <td class="col-size">${v.sizeFormatted}</td>
    <td class="col-date">${v.modified}</td>
    <td class="col-actions" data-action-stop>
      <button class="btn-small btn-folder" data-action="openVideoFile" data-path="${hp}" title="${hp}">&#128193;</button>
    </td>
  </tr>`;
}

function renderVideoTable() {
    clearTableQueryLoadingRow('videoQueryLoadingRow', 'videoTable');
    if (!document.getElementById('videoTable')) {
        const tableWrap = document.getElementById('videoTableWrap');
        if (tableWrap && filteredVideos.length > 0) {
            tableWrap.innerHTML = buildVideoTableHtml();
            const st = document.getElementById('videoStats');
            if (st) st.style.display = 'flex';
            if (typeof initColumnResize === 'function') initColumnResize(document.getElementById('videoTable'));
            if (typeof initTableColumnReorder === 'function') initTableColumnReorder('videoTable', 'videoColumnOrder');
        }
    }
    const tbody = document.getElementById('videoTableBody');
    if (!tbody) return;
    videoRenderCount = _videoOffset + filteredVideos.length;
    if (_videoOffset === 0) {
        tbody.innerHTML = filteredVideos.map(buildVideoRow).join('');
    } else {
        const loadMoreRow = tbody.querySelector('tr [data-action="loadMoreVideos"]')?.closest('tr');
        if (loadMoreRow) loadMoreRow.remove();
        tbody.insertAdjacentHTML('beforeend', filteredVideos.map(buildVideoRow).join(''));
    }
    const videoHasMore = _videoTotalCountCapped
        ? (filteredVideos.length === VIDEO_PAGE_SIZE)
        : (videoRenderCount < _videoTotalCount);
    if (videoHasMore) {
        const totalShown = _videoTotalCountCapped ? _videoTotalCount.toLocaleString() + '+' : _videoTotalCount.toLocaleString();
        const line = catalogFmt('ui.js.load_more_hint', {
            shown: videoRenderCount.toLocaleString(),
            total: totalShown,
        });
        tbody.insertAdjacentHTML('beforeend',
            `<tr><td colspan="7" style="text-align:center;padding:12px;color:var(--text-muted);cursor:pointer;" data-action="loadMoreVideos">
        ${typeof escapeHtml === 'function' ? escapeHtml(line) : line}
      </td></tr>`);
    }
}

function buildVideoTableHtml() {
    const tc = typeof appTableCol === 'function' ? appTableCol : (k) => k;
    const sel = typeof escapeHtml === 'function' ? escapeHtml(tc('ui.audio.th_select_all')) : tc('ui.audio.th_select_all');
    return `<table class="audio-table" id="videoTable">
    <thead><tr>
      <th class="col-cb"><input type="checkbox" class="batch-cb batch-cb-all" data-batch-action="toggleAll" title="${sel}"></th>
      <th data-action="sortVideo" data-key="name" style="width: 26%;">${tc('ui.export.col_name')} <span class="sort-arrow" id="videoSortArrowName">&#9660;</span><span class="col-resize"></span></th>
      <th data-action="sortVideo" data-key="directory" style="width: 36%;">${tc('ui.export.col_path')} <span class="sort-arrow" id="videoSortArrowDirectory"></span><span class="col-resize"></span></th>
      <th data-action="sortVideo" data-key="format" style="width: 70px;">${tc('ui.export.col_format')} <span class="sort-arrow" id="videoSortArrowFormat"></span><span class="col-resize"></span></th>
      <th data-action="sortVideo" data-key="size" class="col-size" style="width: 90px;">${tc('ui.export.col_size')} <span class="sort-arrow" id="videoSortArrowSize"></span><span class="col-resize"></span></th>
      <th data-action="sortVideo" data-key="modified" class="col-date" style="width: 100px;">${tc('ui.export.col_modified')} <span class="sort-arrow" id="videoSortArrowModified"></span><span class="col-resize"></span></th>
      <th class="col-actions" style="width: 50px;"></th>
    </tr></thead>
    <tbody id="videoTableBody"></tbody>
  </table>`;
}

function loadMoreVideos() {
    _videoOffset = videoRenderCount;
    fetchVideoPage();
}

function sortVideo(key, forceAsc) {
    if (typeof forceAsc === 'boolean') {
        videoSortKey = key;
        videoSortAsc = forceAsc;
    } else if (videoSortKey === key) {
        videoSortAsc = !videoSortAsc;
    } else {
        videoSortKey = key;
        videoSortAsc = true;
    }
    ['Name', 'Directory', 'Format', 'Size', 'Modified'].forEach((k) => {
        const el = document.getElementById('videoSortArrow' + k);
        if (el) {
            const isActive = k.toLowerCase() === videoSortKey;
            el.innerHTML = isActive ? (videoSortAsc ? '&#9650;' : '&#9660;') : '';
        }
    });
    filterVideos();
    if (typeof saveSortState === 'function') saveSortState('video', videoSortKey, videoSortAsc);
}

registerFilter('filterVideos', {
    inputId: 'videoSearchInput',
    regexToggleId: 'regexVideo',
    resetOffset() {
        _videoOffset = 0;
    },
    fetchFn() {
        _lastVideoSearch = this.lastSearch || '';
        _lastVideoMode = this.lastMode || 'fuzzy';
        fetchVideoPage();
    },
});

function filterVideos() {
    applyFilter('filterVideos');
}

async function loadVideoFiles() {
    _videoLoaded = true;
    _videoOffset = 0;
    videoRenderCount = 0;
    await fetchVideoPage();
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => {
            void rebuildVideoStats(true);
        });
    } else {
        setTimeout(() => {
            void rebuildVideoStats(true);
        }, 0);
    }
}

async function stopVideoScan() {
    try {
        await window.vstUpdater.stopVideoScan();
    } catch {
        /* ignore */
    }
}

async function scanVideos(resume = false, overrideRoots = null) {
    if (typeof showGlobalProgress === 'function') showGlobalProgress();
    const btn = document.getElementById('btnScanVideos');
    const resumeBtn = document.getElementById('btnResumeVideo');
    const stopBtn = document.getElementById('btnStopVideo');
    const progressBar = document.getElementById('videoProgressBar');
    const progressFill = document.getElementById('videoProgressFill');
    const tableWrap = document.getElementById('videoTableWrap');

    const excludePaths = resume ? allVideos.map((v) => v.path) : null;

    if (typeof btnLoading === 'function') btnLoading(btn, true);
    if (btn) {
        btn.innerHTML = '&#8635; ' + catalogFmt(resume ? 'ui.js.resuming_btn' : 'ui.js.scanning_btn');
        btn.disabled = true;
    }
    if (resumeBtn) resumeBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = '';
    if (progressBar) progressBar.classList.add('active');
    if (progressFill) progressFill.style.width = '0%';

    allVideos = [];
    filteredVideos = [];
    _videoOffset = 0;
    videoRenderCount = 0;
    _videoScanDbView = false;
    if (tableWrap) {
        tableWrap.innerHTML = `<div class="state-message" id="videoEmptyState">
            <div class="state-icon">&#127909;</div>
            <h2 data-i18n="ui.h2.video_index">${typeof appFmt === 'function' ? appFmt('ui.h2.video_index') : 'Video index'}</h2>
            <p data-i18n="ui.p.videos_scanning">${typeof appFmt === 'function' ? appFmt('ui.p.videos_scanning') : 'Scanning…'}</p>
        </div>`;
    }

    let foundApprox = 0;
    const onProg = window.vstUpdater.onVideoScanProgress((payload) => {
        if (!payload) return;
        if (payload.phase === 'scanning' && Array.isArray(payload.videoFiles)) {
            const batch = payload.videoFiles;
            allVideos.push(...batch);
            foundApprox = payload.found != null ? payload.found : allVideos.length;
            if (typeof window !== 'undefined') window.__videoScanPendingFound = foundApprox;
            if (typeof applyInventoryCountsPartial === 'function') applyInventoryCountsPartial({video: foundApprox});
            if (progressFill && foundApprox > 0) {
                const w = Math.min(100, 8 + Math.log1p(foundApprox) * 4);
                progressFill.style.width = w + '%';
            }
            if (_videoScanDbView) {
                _videoOffset = 0;
                videoRenderCount = 0;
                void fetchVideoPage();
            }
        }
    });
    videoScanProgressCleanup = onProg;

    try {
        const roots = overrideRoots;
        await window.vstUpdater.scanVideoFiles(roots, excludePaths);
    } catch (e) {
        if (typeof showToast === 'function') showToast(String(e && e.message ? e.message : e), 5000, 'error');
    } finally {
        if (typeof btnLoading === 'function') btnLoading(btn, false);
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '&#127909; <span data-i18n="ui.btn.scan_videos">' + (typeof appFmt === 'function' ? appFmt('ui.btn.scan_videos') : 'Scan videos') + '</span>';
        }
        if (stopBtn) stopBtn.style.display = 'none';
        if (resumeBtn && allVideos.length > 0) resumeBtn.style.display = '';
        if (progressBar) progressBar.classList.remove('active');
        if (progressFill) progressFill.style.width = '100%';
        if (typeof hideGlobalProgress === 'function') hideGlobalProgress();
        if (videoScanProgressCleanup) {
            videoScanProgressCleanup();
            videoScanProgressCleanup = null;
        }
        if (typeof window !== 'undefined') delete window.__videoScanPendingFound;
        if (typeof scheduleRefreshInventoryFromDb === 'function') scheduleRefreshInventoryFromDb();
        _videoScanDbView = true;
        _videoOffset = 0;
        videoRenderCount = 0;
        await fetchVideoPage();
        await rebuildVideoStats(true);
        const empty = document.getElementById('videoEmptyState');
        if (empty) empty.remove();
    }
}

function openVideoFile(path) {
    window.vstUpdater.openFileDefault(path)
        .then(() => {
            if (typeof showToast === 'function') showToast(toastFmt('toast.revealed_in_finder'));
        })
        .catch((e) => {
            if (typeof showToast === 'function') showToast(toastFmt('toast.failed', {err: e}), 4000, 'error');
        });
}
