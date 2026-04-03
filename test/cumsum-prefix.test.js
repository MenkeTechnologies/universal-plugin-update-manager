const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function cumsum(arr) {
  const out = [];
  let s = 0;
  for (const x of arr) {
    s += x;
    out.push(s);
  }
  return out;
}

function diffs(arr) {
  const out = [];
  for (let i = 1; i < arr.length; i++) out.push(arr[i] - arr[i - 1]);
  return out;
}

describe('cumsum', () => {
  it('prefix sums', () => assert.deepStrictEqual(cumsum([1, 2, 3]), [1, 3, 6]));
});

describe('diffs', () => {
  it('adjacent deltas', () => assert.deepStrictEqual(diffs([1, 4, 9]), [3, 5]));
});
