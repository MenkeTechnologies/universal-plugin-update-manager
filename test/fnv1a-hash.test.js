const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

describe('fnv1a32', () => {
  it('stable', () => assert.strictEqual(fnv1a32('audio'), fnv1a32('audio')));
  it('differs', () => assert.notStrictEqual(fnv1a32('a'), fnv1a32('b')));
});
