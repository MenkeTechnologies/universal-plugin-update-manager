const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function satisfiesAtLeast(version, min) {
  const v = version.split('.').map(Number);
  const m = min.split('.').map(Number);
  const n = Math.max(v.length, m.length);
  for (let i = 0; i < n; i++) {
    const a = v[i] || 0;
    const b = m[i] || 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return true;
}

describe('satisfiesAtLeast', () => {
  it('greater minor', () => assert.strictEqual(satisfiesAtLeast('2.1.0', '2.0.9'), true));
  it('less', () => assert.strictEqual(satisfiesAtLeast('1.0.0', '2.0.0'), false));
});
