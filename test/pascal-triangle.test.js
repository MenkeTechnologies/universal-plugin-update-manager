const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function pascalRow(n) {
  const row = [1];
  for (let k = 0; k < n; k++) row.push((row[k] * (n - k)) / (k + 1));
  return row;
}

describe('pascalRow', () => {
  it('row 4', () => assert.deepStrictEqual(pascalRow(4), [1, 4, 6, 4, 1]));
});
