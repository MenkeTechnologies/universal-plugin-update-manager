const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function rleEncode(s) {
  if (!s) return '';
  let out = '';
  let c = s[0];
  let n = 1;
  for (let i = 1; i <= s.length; i++) {
    if (s[i] === c) n++;
    else {
      out += n + c;
      c = s[i];
      n = 1;
    }
  }
  return out;
}

describe('rleEncode', () => {
  it('basic', () => assert.strictEqual(rleEncode('aaabbc'), '3a2b1c'));
});
