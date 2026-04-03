const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function formatMs(ms) {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

describe('formatMs', () => {
  it('ms', () => assert.strictEqual(formatMs(500), '500 ms'));
  it('seconds', () => assert.ok(formatMs(3500).includes('3.5')));
  it('minutes', () => assert.ok(formatMs(125000).includes('m')));
});
