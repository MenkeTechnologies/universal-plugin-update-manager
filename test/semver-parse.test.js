const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function parseSemver(s) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/.exec(s);
  if (!m) return null;
  return {
    major: +m[1],
    minor: +m[2],
    patch: +m[3],
    prerelease: m[4] || null,
    build: m[5] || null,
  };
}

describe('parseSemver', () => {
  it('plain', () => assert.deepStrictEqual(parseSemver('1.2.3'), { major: 1, minor: 2, patch: 3, prerelease: null, build: null }));
});
