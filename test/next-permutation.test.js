const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function nextPermutation(arr) {
  let i = arr.length - 2;
  while (i >= 0 && arr[i] >= arr[i + 1]) i--;
  if (i < 0) return false;
  let j = arr.length - 1;
  while (arr[j] <= arr[i]) j--;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  for (let l = i + 1, r = arr.length - 1; l < r; l++, r--) [arr[l], arr[r]] = [arr[r], arr[l]];
  return true;
}

describe('nextPermutation', () => {
  it('step', () => {
    const a = [1, 2, 3];
    assert.strictEqual(nextPermutation(a), true);
    assert.deepStrictEqual(a, [1, 3, 2]);
  });
});
