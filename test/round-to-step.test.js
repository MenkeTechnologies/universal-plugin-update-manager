const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function roundToStep(x, step) {
  return Math.round(x / step) * step;
}

describe('roundToStep', () => {
  it('grid', () => assert.strictEqual(roundToStep(14, 5), 15));
});
