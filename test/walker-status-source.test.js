/**
 * Real walker-status.js: _renderTile scanning vs idle HTML and border styling.
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts, defaultDocument } = require('./frontend-vm-harness.js');

function loadWalkerSandbox(bodyId, tileId) {
  const body = { innerHTML: '' };
  const statusEl = { innerHTML: '' };
  const tile = {
    style: { borderColor: '' },
    querySelector(sel) {
      return sel === '.walker-tile-status' ? statusEl : null;
    },
  };
  const base = defaultDocument();
  const document = {
    ...base,
    getElementById(id) {
      if (id === bodyId) return body;
      if (id === tileId) return tile;
      return null;
    },
  };
  const W = loadFrontendScripts(['utils.js', 'walker-status.js'], { document });
  return { W, body, statusEl, tile };
}

describe('frontend/js/walker-status.js _renderTile (vm-loaded)', () => {
  let W;
  let body;
  let statusEl;
  let tile;

  before(() => {
    ({ W, body, statusEl, tile } = loadWalkerSandbox('walkerPluginBody', 'walkerTilePlugin'));
  });

  it('when scanning, lists dirs with escaped HTML and sets accent border', () => {
    W._renderTile('walkerPluginBody', 'walkerTilePlugin', ['/a & <b>', '/c'], 'var(--cyan)', 4, true);
    assert.ok(body.innerHTML.includes('&amp;'));
    assert.ok(body.innerHTML.includes('/a'));
    assert.ok(statusEl.innerHTML.includes('scanning'));
    assert.strictEqual(tile.style.borderColor, 'var(--cyan)');
  });

  it('when idle with empty dirs, shows waiting copy and resets border', () => {
    W._renderTile('walkerPluginBody', 'walkerTilePlugin', [], 'var(--cyan)', 4, false);
    assert.ok(body.innerHTML.includes('Waiting for scan'));
    assert.strictEqual(tile.style.borderColor, 'var(--border)');
  });
});
