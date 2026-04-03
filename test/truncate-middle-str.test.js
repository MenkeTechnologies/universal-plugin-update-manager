const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function truncateMiddle(s, max, sep = '…') {
  if (s.length <= max) return s;
  const keep = max - sep.length;
  const a = Math.ceil(keep / 2);
  const b = Math.floor(keep / 2);
  return s.slice(0, a) + sep + s.slice(s.length - b);
}

describe('truncateMiddle', () => {
  it('long', () => assert.strictEqual(truncateMiddle('abcdefghijklmnop', 10, '…'), 'abcde…mnop'));
});
