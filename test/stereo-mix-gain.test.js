const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function mixStereoToMono(l, r, gl = 0.5, gr = 0.5) {
  return l * gl + r * gr;
}

describe('mixStereoToMono', () => {
  it('equal', () => assert.strictEqual(mixStereoToMono(1, -1), 0));
});
