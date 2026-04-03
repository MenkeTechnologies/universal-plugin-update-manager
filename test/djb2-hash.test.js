const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function djb2(s) {
  let hash = 5381;
  for (let i = 0; i < s.length; i++) hash = (hash * 33) ^ s.charCodeAt(i);
  return hash >>> 0;
}

describe('djb2', () => {
  it('empty', () => assert.strictEqual(djb2(''), 5381 >>> 0));
});
