const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function formatBytesSi(n) {
  if (n < 1000) return `${n} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = n;
  let i = -1;
  do {
    v /= 1000;
    i++;
  } while (v >= 1000 && i < units.length - 1);
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${units[i]}`;
}

describe('formatBytesSi', () => {
  it('kb', () => assert.ok(formatBytesSi(1500).includes('KB')));
});
