/**
 * Extra parseFzfQuery / parseToken cases from frontend/js/utils.js (vm).
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts, defaultDocument } = require('./frontend-vm-harness.js');

describe('parseFzfQuery extended (vm-loaded utils.js)', () => {
  let U;

  before(() => {
    U = loadFrontendScripts(['utils.js'], { document: defaultDocument() });
  });

  it('standalone pipe token is ignored', () => {
    const g = U.parseFzfQuery('a | | b');
    assert.strictEqual(g.length, 2);
  });

  it('token ending with pipe closes a group (a |)', () => {
    const g = U.parseFzfQuery('foo |');
    assert.strictEqual(g.length, 1);
    assert.strictEqual(g[0][0].text, 'foo');
  });

  it('parseToken: leading quote without closing is exact remainder', () => {
    const t = U.parseToken("'partial");
    assert.strictEqual(t.type, 'exact');
    assert.strictEqual(t.text, 'partial');
  });

  it('parseToken: full quoted exact', () => {
    const t = U.parseToken("'foo bar'");
    assert.strictEqual(t.type, 'exact');
    assert.strictEqual(t.text, 'foo bar');
  });

  it('parseToken: negate strips before other modifiers', () => {
    const t = U.parseToken('!^pre');
    assert.strictEqual(t.negate, true);
    assert.strictEqual(t.type, 'prefix');
    assert.strictEqual(t.text, 'pre');
  });

  it('multiple AND groups preserve order', () => {
    const g = U.parseFzfQuery('one two three');
    assert.strictEqual(g.length, 3);
    assert.strictEqual(g[0][0].text, 'one');
    assert.strictEqual(g[1][0].text, 'two');
    assert.strictEqual(g[2][0].text, 'three');
  });
});
