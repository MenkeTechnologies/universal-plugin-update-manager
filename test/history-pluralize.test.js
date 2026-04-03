const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Pattern from frontend/js/history.js renderHistoryList labels ──
function scanCountLabel(type, count) {
  if (type === 'preset') {
    return `${count} preset${count !== 1 ? 's' : ''}`;
  }
  if (type === 'daw') {
    return `${count} project${count !== 1 ? 's' : ''}`;
  }
  if (type === 'audio') {
    return `${count} sample${count !== 1 ? 's' : ''}`;
  }
  return `${count} plugin${count !== 1 ? 's' : ''}`;
}

describe('scanCountLabel', () => {
  it('singular plugin', () => {
    assert.strictEqual(scanCountLabel('plugin', 1), '1 plugin');
  });

  it('plural plugins', () => {
    assert.strictEqual(scanCountLabel('plugin', 0), '0 plugins');
    assert.strictEqual(scanCountLabel('plugin', 2), '2 plugins');
  });

  it('samples', () => {
    assert.strictEqual(scanCountLabel('audio', 1), '1 sample');
    assert.strictEqual(scanCountLabel('audio', 100), '100 samples');
  });

  it('projects', () => {
    assert.strictEqual(scanCountLabel('daw', 1), '1 project');
    assert.strictEqual(scanCountLabel('daw', 5), '5 projects');
  });

  it('presets', () => {
    assert.strictEqual(scanCountLabel('preset', 1), '1 preset');
    assert.strictEqual(scanCountLabel('preset', 3), '3 presets');
  });
});
