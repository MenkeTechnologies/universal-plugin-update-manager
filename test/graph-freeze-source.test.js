/**
 * Real frontend/js/graph-freeze.js: per-graph freeze map in prefs + AE canvas id mapping.
 */
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadGraphFreezeSandbox(prefsStore, extra = {}) {
  const events = [];
  class CustomEventPolyfill {
    constructor(type, init) {
      this.type = type;
      this.detail = init && init.detail;
    }
  }
  const sandbox = {
    console,
    CustomEvent: CustomEventPolyfill,
    prefs: {
      getObject: () => null,
      getItem: (k) => (Object.prototype.hasOwnProperty.call(prefsStore, k) ? prefsStore[k] : null),
      setItem: (k, v) => {
        prefsStore[k] = String(v);
      },
      removeItem: (k) => {
        delete prefsStore[k];
      },
    },
    document: {
      dispatchEvent: (e) => {
        events.push(e);
      },
      addEventListener: () => {},
      createElement: () => ({}),
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
    },
    ...extra,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const code = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'js', 'graph-freeze.js'), 'utf8');
  vm.runInContext(code, sandbox);
  return { sandbox, events };
}

describe('frontend/js/graph-freeze.js (vm-loaded)', () => {
  let prefsStore;

  beforeEach(() => {
    prefsStore = {};
  });

  it('exports freeze id constants and query helpers on window', () => {
    const { sandbox: S } = loadGraphFreezeSandbox(prefsStore);
    assert.ok(S.GRAPH_FREEZE_ID);
    assert.strictEqual(typeof S.isGraphFrozen, 'function');
    assert.strictEqual(typeof S.setGraphFrozen, 'function');
    assert.strictEqual(typeof S.toggleGraphFrozen, 'function');
    assert.strictEqual(typeof S.aeCanvasIdToGraphFreezeId, 'function');
  });

  it('setGraphFrozen / toggleGraphFrozen persist in graphFreezeMap JSON', () => {
    const { sandbox: S } = loadGraphFreezeSandbox(prefsStore);
    const id = S.GRAPH_FREEZE_ID.VIZ_FFT;
    assert.strictEqual(S.isGraphFrozen(id), false);
    S.setGraphFrozen(id, true);
    assert.strictEqual(S.isGraphFrozen(id), true);
    const raw = prefsStore.graphFreezeMap;
    assert.ok(raw);
    const m = JSON.parse(raw);
    assert.strictEqual(m[id], true);
    const frozen = S.toggleGraphFrozen(id);
    assert.strictEqual(frozen, false);
    assert.strictEqual(S.isGraphFrozen(id), false);
  });

  it('setGraphFrozen with on=false removes key; noop id guards', () => {
    const { sandbox: S } = loadGraphFreezeSandbox(prefsStore);
    const id = S.GRAPH_FREEZE_ID.NP_EQ;
    S.setGraphFrozen(id, true);
    S.setGraphFrozen(id, false);
    const m = JSON.parse(prefsStore.graphFreezeMap || '{}');
    assert.strictEqual(m[id], undefined);
    S.setGraphFrozen('', true);
    S.setGraphFrozen(null, true);
    assert.strictEqual(Object.keys(JSON.parse(prefsStore.graphFreezeMap || '{}')).length, 0);
  });

  it('dispatches graph-freeze-changed when setGraphFrozen changes state', () => {
    const { sandbox: S, events } = loadGraphFreezeSandbox(prefsStore);
    const id = S.GRAPH_FREEZE_ID.AE_EQ;
    S.setGraphFrozen(id, true);
    const ev = events.filter((e) => e && e.type === 'graph-freeze-changed').pop();
    assert.ok(ev);
    assert.strictEqual(ev.detail.id, id);
    assert.strictEqual(ev.detail.frozen, true);
  });

  it('migrateLegacyGlobalPause maps fftAnimationPaused to per-graph ids when map empty', () => {
    prefsStore.fftAnimationPaused = '1';
    const { sandbox: S } = loadGraphFreezeSandbox(prefsStore);
    const m = JSON.parse(prefsStore.graphFreezeMap);
    assert.strictEqual(m[S.GRAPH_FREEZE_ID.NP_FFT], true);
    assert.strictEqual(m[S.GRAPH_FREEZE_ID.NP_EQ], true);
    assert.strictEqual(m[S.GRAPH_FREEZE_ID.AE_EQ], true);
    assert.strictEqual(m[S.GRAPH_FREEZE_ID.VIZ_FFT], true);
    assert.strictEqual(prefsStore.fftAnimationPaused, '0');
    /* Second load must not overwrite an existing map. */
    prefsStore.fftAnimationPaused = '1';
    loadGraphFreezeSandbox(prefsStore);
    const m2 = JSON.parse(prefsStore.graphFreezeMap);
    assert.strictEqual(Object.keys(m2).length, 4);
  });

  it('corrupt graphFreezeMap JSON is treated as empty map', () => {
    prefsStore.graphFreezeMap = '{not json';
    const { sandbox: S } = loadGraphFreezeSandbox(prefsStore);
    const id = S.GRAPH_FREEZE_ID.VIZ_SPEC;
    assert.strictEqual(S.isGraphFrozen(id), false);
    S.setGraphFrozen(id, true);
    assert.strictEqual(S.isGraphFrozen(id), true);
    JSON.parse(prefsStore.graphFreezeMap);
  });

  it('aeCanvasIdToGraphFreezeId covers every Audio Engine graph canvas id', () => {
    const { sandbox: S } = loadGraphFreezeSandbox(prefsStore);
    const GF = S.GRAPH_FREEZE_ID;
    const pairs = [
      ['aeGraphMidSide', GF.AE_MID],
      ['aeGraphBalance', GF.AE_BAL],
      ['aeGraphCorrelation', GF.AE_COR],
      ['aeGraphWidth', GF.AE_WID],
      ['aeGraphCrest', GF.AE_CRE],
      ['aeGraphLMinusR', GF.AE_DLR],
      ['aeGraphEnergy', GF.AE_ENE],
      ['aeGraphGonio', GF.AE_GON],
      ['aeGraphDcOffset', GF.AE_DC],
      ['aeGraphMagHist', GF.AE_HIST],
      ['aeGraphPeakSample', GF.AE_PEAK],
      ['aeGraphMonoWave', GF.AE_MONO_W],
      ['aeGraphSideWave', GF.AE_SIDE_W],
      ['aeGraphLrOverlay', GF.AE_LR_OVR],
      ['aeGraphAbsDiffHist', GF.AE_ABS_DR],
      ['aeGraphLissajous', GF.AE_LISS],
    ];
    for (const [canvasId, want] of pairs) {
      assert.strictEqual(
        S.aeCanvasIdToGraphFreezeId(canvasId),
        want,
        canvasId
      );
    }
    assert.strictEqual(S.aeCanvasIdToGraphFreezeId('unknownCanvas'), null);
    assert.strictEqual(S.aeCanvasIdToGraphFreezeId(''), null);
  });
});
