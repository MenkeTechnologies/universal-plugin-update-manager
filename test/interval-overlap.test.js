const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function overlaps(a, b) {
  return a[0] <= b[1] && b[0] <= a[1];
}

describe('overlaps', () => {
  it('touching', () => assert.strictEqual(overlaps([0, 1], [1, 2]), true));
  it('separate', () => assert.strictEqual(overlaps([0, 1], [2, 3]), false));
});
