const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function stripBom(s) {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

describe('stripBom', () => {
  it('removes', () => assert.strictEqual(stripBom('\ufeffhi'), 'hi'));
  it('noop', () => assert.strictEqual(stripBom('hi'), 'hi'));
});
