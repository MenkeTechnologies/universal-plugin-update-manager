const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function argmax(arr) {
  let bi = 0;
  for (let i = 1; i < arr.length; i++) if (arr[i] > arr[bi]) bi = i;
  return bi;
}

function argmin(arr) {
  let bi = 0;
  for (let i = 1; i < arr.length; i++) if (arr[i] < arr[bi]) bi = i;
  return bi;
}

describe('argmax / argmin', () => {
  it('argmax', () => assert.strictEqual(argmax([1, 9, 2]), 1));
  it('argmin', () => assert.strictEqual(argmin([3, 1, 4]), 1));
});
