const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function mean(arr) {
  if (arr.length === 0) return NaN;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
  if (arr.length === 0) return NaN;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

describe('mean', () => {
  it('basic', () => assert.strictEqual(mean([2, 4, 6]), 4));
  it('empty', () => assert.ok(Number.isNaN(mean([]))));
});

describe('median', () => {
  it('odd', () => assert.strictEqual(median([3, 1, 2]), 2));
  it('even', () => assert.strictEqual(median([1, 2, 3, 4]), 2.5));
});
