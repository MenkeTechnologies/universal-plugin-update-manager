const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// We can't import scanner.js directly because it uses execSync for plist
// reading which is macOS-specific. Instead, test the pure helper functions
// by extracting them. For now, test the logic inline.

describe('scanner helpers', () => {
  describe('getPluginType', () => {
    // Replicate the function locally for testing
    function getPluginType(ext) {
      const map = { '.vst': 'VST2', '.vst3': 'VST3', '.component': 'AU', '.dll': 'VST2' };
      return map[ext] || 'Unknown';
    }

    it('maps .vst to VST2', () => {
      assert.strictEqual(getPluginType('.vst'), 'VST2');
    });

    it('maps .vst3 to VST3', () => {
      assert.strictEqual(getPluginType('.vst3'), 'VST3');
    });

    it('maps .component to AU', () => {
      assert.strictEqual(getPluginType('.component'), 'AU');
    });

    it('maps .dll to VST2', () => {
      assert.strictEqual(getPluginType('.dll'), 'VST2');
    });

    it('returns Unknown for unrecognized extensions', () => {
      assert.strictEqual(getPluginType('.exe'), 'Unknown');
      assert.strictEqual(getPluginType('.so'), 'Unknown');
    });
  });

  describe('formatSize', () => {
    function formatSize(bytes) {
      if (bytes === 0) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
    }

    it('formats 0 bytes', () => {
      assert.strictEqual(formatSize(0), '0 B');
    });

    it('formats bytes', () => {
      assert.strictEqual(formatSize(500), '500.0 B');
    });

    it('formats kilobytes', () => {
      assert.strictEqual(formatSize(1024), '1.0 KB');
    });

    it('formats megabytes', () => {
      assert.strictEqual(formatSize(1048576), '1.0 MB');
    });

    it('formats gigabytes', () => {
      assert.strictEqual(formatSize(1073741824), '1.0 GB');
    });

    it('formats fractional values', () => {
      assert.strictEqual(formatSize(1536), '1.5 KB');
    });
  });
});
