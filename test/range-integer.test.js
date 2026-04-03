const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function range(start, end, step = 1) {
  const out = [];
  if (step > 0) for (let i = start; i < end; i += step) out.push(i);
  else for (let i = start; i > end; i += step) out.push(i);
  return out;
}

describe('range', () => {
  it('0..3', () => assert.deepStrictEqual(range(0, 3), [0, 1, 2]));
  it('step 2', () => assert.deepStrictEqual(range(0, 5, 2), [0, 2, 4]));
  it('negative', () => assert.deepStrictEqual(range(3, 0, -1), [3, 2, 1]));
});
