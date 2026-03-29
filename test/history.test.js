const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const history = require('../frontend/history');

let tmpFile;

beforeEach(() => {
  tmpFile = path.join(os.tmpdir(), `test-history-${Date.now()}.json`);
  history.setHistoryFile(tmpFile);
});

afterEach(() => {
  try { fs.unlinkSync(tmpFile); } catch {}
});

const fakePlugins = [
  { name: 'PluginA', path: '/lib/PluginA.vst3', type: 'VST3', version: '1.0.0', manufacturer: 'TestCo', size: '10 MB', modified: '2025-01-01' },
  { name: 'PluginB', path: '/lib/PluginB.component', type: 'AU', version: '2.1.0', manufacturer: 'OtherCo', size: '5 MB', modified: '2025-02-01' },
];

const fakeDirs = ['/lib'];

describe('history', () => {
  it('starts with empty history', () => {
    const scans = history.getScans();
    assert.deepStrictEqual(scans, []);
  });

  it('saves a scan and retrieves it', () => {
    const snapshot = history.saveScan(fakePlugins, fakeDirs);
    assert.ok(snapshot.id);
    assert.strictEqual(snapshot.pluginCount, 2);

    const scans = history.getScans();
    assert.strictEqual(scans.length, 1);
    assert.strictEqual(scans[0].id, snapshot.id);
    assert.strictEqual(scans[0].pluginCount, 2);
  });

  it('getScans returns summaries without full plugin data', () => {
    history.saveScan(fakePlugins, fakeDirs);
    const scans = history.getScans();
    assert.strictEqual(scans[0].plugins, undefined);
  });

  it('getScanDetail returns full plugin data', () => {
    const snapshot = history.saveScan(fakePlugins, fakeDirs);
    const detail = history.getScanDetail(snapshot.id);
    assert.strictEqual(detail.plugins.length, 2);
    assert.strictEqual(detail.plugins[0].name, 'PluginA');
    assert.deepStrictEqual(detail.directories, fakeDirs);
  });

  it('getScanDetail returns null for unknown id', () => {
    assert.strictEqual(history.getScanDetail('nonexistent'), null);
  });

  it('deleteScan removes a scan', () => {
    const s1 = history.saveScan(fakePlugins, fakeDirs);
    const s2 = history.saveScan(fakePlugins, fakeDirs);
    history.deleteScan(s1.id);
    const scans = history.getScans();
    assert.strictEqual(scans.length, 1);
    assert.strictEqual(scans[0].id, s2.id);
  });

  it('clearHistory removes all scans', () => {
    history.saveScan(fakePlugins, fakeDirs);
    history.saveScan(fakePlugins, fakeDirs);
    history.clearHistory();
    assert.deepStrictEqual(history.getScans(), []);
  });

  it('limits history to 50 scans', () => {
    for (let i = 0; i < 55; i++) {
      history.saveScan(fakePlugins, fakeDirs);
    }
    assert.strictEqual(history.getScans().length, 50);
  });

  it('getLatestScan returns the most recent scan', () => {
    history.saveScan([fakePlugins[0]], fakeDirs);
    history.saveScan(fakePlugins, fakeDirs);
    const latest = history.getLatestScan();
    assert.strictEqual(latest.pluginCount, 2);
  });

  it('getLatestScan returns null when empty', () => {
    assert.strictEqual(history.getLatestScan(), null);
  });

  describe('diffScans', () => {
    it('detects added plugins', () => {
      const s1 = history.saveScan([fakePlugins[0]], fakeDirs);
      const s2 = history.saveScan(fakePlugins, fakeDirs);
      const diff = history.diffScans(s1.id, s2.id);
      assert.strictEqual(diff.added.length, 1);
      assert.strictEqual(diff.added[0].name, 'PluginB');
      assert.strictEqual(diff.removed.length, 0);
    });

    it('detects removed plugins', () => {
      const s1 = history.saveScan(fakePlugins, fakeDirs);
      const s2 = history.saveScan([fakePlugins[0]], fakeDirs);
      const diff = history.diffScans(s1.id, s2.id);
      assert.strictEqual(diff.removed.length, 1);
      assert.strictEqual(diff.removed[0].name, 'PluginB');
      assert.strictEqual(diff.added.length, 0);
    });

    it('detects version changes', () => {
      const s1 = history.saveScan(fakePlugins, fakeDirs);
      const updated = [{ ...fakePlugins[0], version: '1.1.0' }, fakePlugins[1]];
      const s2 = history.saveScan(updated, fakeDirs);
      const diff = history.diffScans(s1.id, s2.id);
      assert.strictEqual(diff.versionChanged.length, 1);
      assert.strictEqual(diff.versionChanged[0].name, 'PluginA');
      assert.strictEqual(diff.versionChanged[0].previousVersion, '1.0.0');
      assert.strictEqual(diff.versionChanged[0].version, '1.1.0');
    });

    it('ignores version changes when either is Unknown', () => {
      const s1 = history.saveScan([{ ...fakePlugins[0], version: 'Unknown' }], fakeDirs);
      const s2 = history.saveScan([{ ...fakePlugins[0], version: '1.0.0' }], fakeDirs);
      const diff = history.diffScans(s1.id, s2.id);
      assert.strictEqual(diff.versionChanged.length, 0);
    });

    it('returns null for invalid scan ids', () => {
      assert.strictEqual(history.diffScans('bad1', 'bad2'), null);
    });

    it('reports no changes for identical scans', () => {
      const s1 = history.saveScan(fakePlugins, fakeDirs);
      const s2 = history.saveScan(fakePlugins, fakeDirs);
      const diff = history.diffScans(s1.id, s2.id);
      assert.strictEqual(diff.added.length, 0);
      assert.strictEqual(diff.removed.length, 0);
      assert.strictEqual(diff.versionChanged.length, 0);
    });
  });
});
