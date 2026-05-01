/**
 * Shared Node vm + DOM stubs for loading real frontend/js scripts in tests.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

/** Minimal <div> so escapeHtml() in utils.js matches browser entity encoding. */
function createTextDiv() {
  let raw = '';
  return {
    set textContent(v) {
      raw = v == null ? '' : String(v);
    },
    get textContent() {
      return raw;
    },
    get innerHTML() {
      return raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },
  };
}

function defaultDocument() {
  return {
    createElement: () => createTextDiv(),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    body: { insertAdjacentHTML: () => {} },
  };
}

/**
 * @param {string[]} relativePaths - e.g. ['utils.js', 'favorites.js']
 * @param {Record<string, unknown>} [overrides] - merged into sandbox before run
 */
function loadFrontendScripts(relativePaths, overrides = {}) {
  const batchByTab = new Map();
  function batchSetForTabId(tabId) {
    if (!batchByTab.has(tabId)) batchByTab.set(tabId, new Set());
    return batchByTab.get(tabId);
  }
  const sandbox = {
    console,
    performance: { now: () => 0 },
    KVR_MANUFACTURER_MAP: {},
    prefs: {
      getObject: () => null,
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    document: defaultDocument(),
    setTimeout: () => 0,
    clearTimeout: () => {},
    requestAnimationFrame: (cb) => {
      if (typeof cb === 'function') cb();
      return 0;
    },
    // No-op `window.addEventListener` / `removeEventListener`. Production code (e.g.
    // `multi-filter.js`) registers `resize`/`scroll` listeners on `window` at module
    // load; in the real WebView these always exist. The sandbox is its own `window`
    // (see assignment below), so the listener APIs need to live on the sandbox itself.
    addEventListener: () => {},
    removeEventListener: () => {},
    batchSetForTabId,
    ...overrides,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const root = path.join(__dirname, '..', 'frontend', 'js');
  for (const rel of relativePaths) {
    vm.runInContext(fs.readFileSync(path.join(root, rel), 'utf8'), sandbox);
  }
  return sandbox;
}

module.exports = {
  createTextDiv,
  defaultDocument,
  loadFrontendScripts,
};
