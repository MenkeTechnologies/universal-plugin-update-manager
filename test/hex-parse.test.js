const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function parseHexRgb(s) {
  const m = s.trim().match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

describe('parseHexRgb', () => {
  it('with hash', () => assert.deepStrictEqual(parseHexRgb('#0a1b2c'), { r: 10, g: 27, b: 44 }));
  it('invalid', () => assert.strictEqual(parseHexRgb('zzz'), null));
});
