// ── Generic Trello-style Drag-to-Reorder ──
// Creates floating ghost clone + dashed placeholder on mousedown/mousemove/mouseup.
// No HTML5 drag API — pure mouse events for consistent Trello feel.
//
// Usage: initDragReorder(container, childSelector, prefsKey, { direction, onReorder, getKey, handleSelector })

function initDragReorder(container, childSelector, prefsKey, opts = {}) {
  if (!container || container._trelloDragInit) return;
  container._trelloDragInit = true;

  const direction = opts.direction || 'vertical';
  const onReorder = opts.onReorder || null;
  const handleSelector = opts.handleSelector || null; // optional: only drag from this handle
  const getKey = opts.getKey || ((el, i) => el.dataset.dragKey || el.dataset.npSection || el.textContent.trim().slice(0, 30) || String(i));
  const deadzone = opts.deadzone || 5;

  let dragged = null, ghost = null, placeholder = null;
  let startX = 0, startY = 0, offsetX = 0, offsetY = 0;
  let isDragging = false;

  // Restore saved order
  if (prefsKey && typeof prefs !== 'undefined') {
    const saved = prefs.getObject(prefsKey, null);
    if (saved && Array.isArray(saved)) {
      const children = [...container.querySelectorAll(childSelector)];
      const map = {};
      children.forEach((c, i) => { map[getKey(c, i)] = c; });
      for (const key of saved) {
        if (map[key]) container.appendChild(map[key]);
      }
      children.forEach((c, i) => {
        if (!saved.includes(getKey(c, i))) container.appendChild(c);
      });
    }
  }

  function saveOrder() {
    if (!prefsKey) return;
    const children = [...container.querySelectorAll(childSelector)];
    const order = children.map((c, i) => getKey(c, i));
    prefs.setItem(prefsKey, order);
  }

  container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const child = e.target.closest(childSelector);
    if (!child || !container.contains(child)) return;
    // If handleSelector specified, only drag from handle
    if (handleSelector && !e.target.closest(handleSelector)) return;
    // Don't drag from inputs, buttons, selects
    if (e.target.closest('input, button, select, textarea, a, .btn-small, .col-resize')) return;

    e.preventDefault();
    dragged = child;
    const rect = child.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    isDragging = false;
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragged) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!isDragging && Math.abs(direction === 'horizontal' ? dx : dy) > deadzone) {
      isDragging = true;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';

      const rect = dragged.getBoundingClientRect();

      // Create placeholder
      placeholder = document.createElement(dragged.tagName);
      placeholder.className = 'trello-placeholder';
      if (direction === 'horizontal') {
        placeholder.style.width = rect.width + 'px';
        placeholder.style.height = rect.height + 'px';
        placeholder.style.display = 'inline-block';
      } else {
        placeholder.style.height = rect.height + 'px';
      }
      dragged.parentNode.insertBefore(placeholder, dragged);

      // Create floating ghost
      ghost = dragged.cloneNode(true);
      ghost.className = dragged.className + ' trello-ghost';
      ghost.style.position = 'fixed';
      ghost.style.zIndex = '20000';
      ghost.style.width = rect.width + 'px';
      ghost.style.height = rect.height + 'px';
      ghost.style.left = rect.left + 'px';
      ghost.style.top = rect.top + 'px';
      ghost.style.pointerEvents = 'none';
      ghost.style.opacity = '0.9';
      ghost.style.transform = direction === 'horizontal' ? 'scale(1.05)' : 'rotate(1deg)';
      ghost.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(5,217,232,0.3)';
      ghost.style.border = '2px solid var(--cyan)';
      ghost.style.borderRadius = '4px';
      ghost.style.background = 'var(--bg-primary)';
      ghost.style.transition = 'none';
      document.body.appendChild(ghost);

      // Hide original
      dragged.style.display = 'none';
    }

    if (!isDragging || !ghost) return;

    // Move ghost
    ghost.style.left = (e.clientX - offsetX) + 'px';
    ghost.style.top = (e.clientY - offsetY) + 'px';

    // Find drop target
    ghost.style.display = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    ghost.style.display = '';
    const target = el?.closest(childSelector);

    if (target && target !== dragged && target !== placeholder && container.contains(target)) {
      const targetRect = target.getBoundingClientRect();
      const mid = direction === 'horizontal'
        ? targetRect.left + targetRect.width / 2
        : targetRect.top + targetRect.height / 2;
      const pos = direction === 'horizontal' ? e.clientX : e.clientY;
      if (pos < mid) {
        container.insertBefore(placeholder, target);
      } else {
        container.insertBefore(placeholder, target.nextSibling);
      }
    }
  });

  document.addEventListener('mouseup', () => {
    if (!dragged) return;
    if (isDragging) {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(dragged, placeholder);
        placeholder.remove();
      }
      dragged.style.display = '';
      if (ghost) { ghost.remove(); ghost = null; }
      placeholder = null;
      saveOrder();
      if (onReorder) onReorder();
    }
    dragged = null;
    isDragging = false;
  });
}

// ── Auto-init common reorderable areas ──

document.addEventListener('DOMContentLoaded', () => {
  // Header stats bar
  const headerStats = document.getElementById('headerStats');
  if (headerStats) {
    initDragReorder(headerStats, '.header-info-item', 'headerStatsOrder', {
      direction: 'horizontal',
      getKey: (el) => el.textContent.trim().split(/\s+/)[0],
    });
  }

  // Stats bar (Plugins Found, Up to Date, etc.)
  const statsBar = document.getElementById('statsBar');
  if (statsBar) {
    initDragReorder(statsBar, '.stat', 'statsBarOrder', {
      direction: 'horizontal',
      getKey: (el) => el.textContent.trim().replace(/\d+/g, '').trim(),
    });
  }

  // Audio/DAW/Preset stats bars
  ['audioStats', 'dawStats', 'presetStats'].forEach(id => {
    const bar = document.getElementById(id);
    if (bar) {
      initDragReorder(bar, 'span', id + 'Order', {
        direction: 'horizontal',
        getKey: (el) => el.textContent.trim().replace(/[\d,.]+/g, '').replace(/\s+/g, ' ').trim(),
      });
    }
  });

  // File browser bookmarks
  setTimeout(() => {
    const favGrid = document.getElementById('fileFavsGrid');
    if (favGrid) {
      initDragReorder(favGrid, '.file-fav-chip', 'fileFavOrder', {
        direction: 'horizontal',
        getKey: (el) => el.dataset.fileNav || el.textContent.trim(),
      });
    }
  }, 1000);
});

// Re-init after favorites render
function initFavDragReorder() {
  const favList = document.getElementById('favList');
  if (favList) {
    initDragReorder(favList, '.fav-item', 'favItemOrder', {
      getKey: (el) => el.querySelector('.fav-name')?.textContent?.trim() || '',
    });
  }
}

// Re-init after recently played render
function initRecentlyPlayedDragReorder() {
  const histList = document.getElementById('npHistoryList');
  if (histList) {
    initDragReorder(histList, '.np-history-item', null, {
      getKey: (el) => el.dataset.path || el.getAttribute('data-path') || '',
      onReorder: () => {
        if (typeof recentlyPlayed === 'undefined') return;
        const items = [...histList.querySelectorAll('.np-history-item')];
        const pathOrder = items.map(el => el.dataset.path || el.getAttribute('data-path'));
        const reordered = [];
        for (const p of pathOrder) {
          const found = recentlyPlayed.find(r => r.path === p);
          if (found) reordered.push(found);
        }
        for (const r of recentlyPlayed) {
          if (!reordered.some(x => x.path === r.path)) reordered.push(r);
        }
        recentlyPlayed.length = 0;
        recentlyPlayed.push(...reordered);
        if (typeof saveRecentlyPlayed === 'function') saveRecentlyPlayed();
      },
    });
  }
}

// Table column reorder (Trello-style on header cells)
function initTableColumnReorder(tableId, prefsKey) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const thead = table.querySelector('thead tr');
  if (!thead) return;

  const getColKey = (th) => th.dataset.key || th.className.split(' ').find(c => c.startsWith('col-')) || th.textContent.trim().split(/\s/)[0];

  // Restore saved column order
  const saved = typeof prefs !== 'undefined' ? prefs.getObject(prefsKey, null) : null;
  if (saved && Array.isArray(saved)) {
    const ths = [...thead.children];
    const thMap = {};
    ths.forEach(th => { thMap[getColKey(th)] = th; });
    const origOrder = ths.map((_, i) => i);
    const newOrder = [];
    for (const key of saved) {
      if (thMap[key]) {
        newOrder.push(ths.indexOf(thMap[key]));
        thead.appendChild(thMap[key]);
      }
    }
    ths.forEach(th => { if (!saved.includes(getColKey(th))) { newOrder.push(ths.indexOf(th)); thead.appendChild(th); } });
    // Reorder existing body rows
    const tbody = table.querySelector('tbody');
    if (tbody && newOrder.length > 0) {
      for (const row of tbody.rows) {
        const cells = [...row.cells];
        const frag = document.createDocumentFragment();
        for (const idx of newOrder) { if (cells[idx]) frag.appendChild(cells[idx]); }
        for (const cell of cells) { if (!frag.contains(cell)) frag.appendChild(cell); }
        row.appendChild(frag);
      }
    }
  }

  // Trello-style drag on header cells
  let dragTh = null, ghost = null, placeholder = null;
  let startX = 0, offsetX = 0, isDragging = false, origIdx = -1;

  thead.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const th = e.target.closest('th');
    if (!th || e.target.closest('.col-resize, input, button')) return;
    e.preventDefault();
    dragTh = th;
    origIdx = [...thead.children].indexOf(th);
    const rect = th.getBoundingClientRect();
    startX = e.clientX;
    offsetX = e.clientX - rect.left;
    isDragging = false;
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragTh) return;
    if (!isDragging && Math.abs(e.clientX - startX) > 5) {
      isDragging = true;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      const rect = dragTh.getBoundingClientRect();
      placeholder = document.createElement('th');
      placeholder.className = 'trello-placeholder';
      placeholder.style.width = rect.width + 'px';
      dragTh.parentNode.insertBefore(placeholder, dragTh);
      ghost = dragTh.cloneNode(true);
      ghost.className = dragTh.className + ' trello-ghost';
      ghost.style.cssText = `position:fixed;z-index:20000;width:${rect.width}px;height:${rect.height}px;left:${rect.left}px;top:${rect.top}px;pointer-events:none;opacity:0.9;transform:scale(1.05);box-shadow:0 4px 16px rgba(0,0,0,0.5);border:2px solid var(--cyan);border-radius:2px;background:var(--bg-primary);`;
      document.body.appendChild(ghost);
      dragTh.style.display = 'none';
    }
    if (!isDragging || !ghost) return;
    ghost.style.left = (e.clientX - offsetX) + 'px';
    ghost.style.display = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    ghost.style.display = '';
    const target = el?.closest('th');
    if (target && target !== dragTh && target !== placeholder && thead.contains(target)) {
      const r = target.getBoundingClientRect();
      if (e.clientX < r.left + r.width / 2) thead.insertBefore(placeholder, target);
      else thead.insertBefore(placeholder, target.nextSibling);
    }
  });

  document.addEventListener('mouseup', () => {
    if (!dragTh) return;
    if (isDragging) {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      const newIdx = [...thead.children].indexOf(placeholder);
      if (placeholder?.parentNode) { placeholder.parentNode.insertBefore(dragTh, placeholder); placeholder.remove(); }
      dragTh.style.display = '';
      if (ghost) { ghost.remove(); ghost = null; }
      // Reorder body cells
      if (origIdx !== newIdx && newIdx >= 0) {
        const tbody = table.querySelector('tbody');
        if (tbody) {
          for (const row of tbody.rows) {
            const cells = [...row.cells];
            if (origIdx < cells.length && newIdx < cells.length) {
              const cell = cells[origIdx];
              const ref = cells[newIdx];
              if (origIdx < newIdx) row.insertBefore(cell, ref.nextSibling);
              else row.insertBefore(cell, ref);
            }
          }
        }
      }
      const order = [...thead.children].map(th => getColKey(th));
      if (typeof prefs !== 'undefined') prefs.setItem(prefsKey, order);
      placeholder = null;
      origIdx = -1;
    }
    dragTh = null;
    isDragging = false;
  });
}
