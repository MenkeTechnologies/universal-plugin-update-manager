const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Simple dotted version compare (major.minor.patch)
function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  const n = Math.max(pa.length, pb.length);
  for (let i = 0; i < n; i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

describe('compareSemver', () => {
  it('equal', () => assert.strictEqual(compareSemver('1.2.3', '1.2.3'), 0));
  it('patch', () => assert.strictEqual(compareSemver('1.0.0', '1.0.1'), -1));
  it('major', () => assert.strictEqual(compareSemver('2.0', '1.9.9'), 1));
  it('shorter padded with zeros', () => assert.strictEqual(compareSemver('1', '1.0.1'), -1));
});
