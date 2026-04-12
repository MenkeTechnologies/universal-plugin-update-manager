/**
 * Mirrors pure helpers in frontend/js/tray-popover.js (IIFE-local).
 * MUST stay in sync with: extractUiTheme, extractAppearance, trayListenUnwrap, appFmtResolved.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function extractUiTheme(obj) {
  if (!obj || typeof obj !== 'object') return null;
  if (typeof obj.ui_theme === 'string') return obj.ui_theme;
  if (typeof obj.uiTheme === 'string') return obj.uiTheme;
  return null;
}

function extractAppearance(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const a = obj.appearance;
  return a && typeof a === 'object' && !Array.isArray(a) ? a : null;
}

function trayListenUnwrap(arg) {
  if (arg == null) return null;
  let cur = arg;
  if (typeof cur === 'string') {
    try {
      cur = JSON.parse(cur);
    } catch {
      return null;
    }
  }
  let depth = 0;
  while (
    depth < 5 &&
    cur &&
    typeof cur === 'object' &&
    !Array.isArray(cur) &&
    Object.prototype.hasOwnProperty.call(cur, 'payload') &&
    cur.payload != null
  ) {
    const next = cur.payload;
    if (typeof next === 'string') {
      try {
        cur = JSON.parse(next);
      } catch {
        break;
      }
    } else {
      cur = next;
    }
    depth++;
  }
  return cur && typeof cur === 'object' ? cur : null;
}

function appFmtResolved(appFmt, primary, ...alts) {
  const pick = (key) => {
    if (!key) return '';
    const s = appFmt(key);
    return s && s !== key ? s : '';
  };
  let v = pick(primary);
  if (v) return v;
  for (let i = 0; i < alts.length; i++) {
    v = pick(alts[i]);
    if (v) return v;
  }
  return '';
}

describe('tray-popover pure mirrors', () => {
  it('extractUiTheme prefers snake_case then camelCase', () => {
    assert.strictEqual(extractUiTheme(null), null);
    assert.strictEqual(extractUiTheme({}), null);
    assert.strictEqual(extractUiTheme({ ui_theme: 'dark' }), 'dark');
    assert.strictEqual(extractUiTheme({ uiTheme: 'light' }), 'light');
    assert.strictEqual(extractUiTheme({ ui_theme: 1 }), null);
  });

  it('extractAppearance rejects non-objects and arrays', () => {
    assert.strictEqual(extractAppearance(null), null);
    assert.strictEqual(extractAppearance({ appearance: [1, 2] }), null);
    assert.deepStrictEqual(extractAppearance({ appearance: { a: '1' } }), { a: '1' });
  });

  it('trayListenUnwrap parses JSON string and unwraps nested payload chains', () => {
    assert.strictEqual(trayListenUnwrap(undefined), null);
    assert.strictEqual(trayListenUnwrap('not json'), null);
    const inner = { title: 'x', playing: true };
    assert.deepStrictEqual(trayListenUnwrap(JSON.stringify(inner)), inner);
    assert.deepStrictEqual(trayListenUnwrap({ payload: inner }), inner);
    assert.deepStrictEqual(trayListenUnwrap({ payload: JSON.stringify(inner) }), inner);
    /* Depth cap 5: six nested payload shells leaves one wrapper. */
    let deep = inner;
    for (let i = 0; i < 6; i++) deep = { payload: deep };
    assert.deepStrictEqual(trayListenUnwrap(deep), { payload: inner });
  });

  it('appFmtResolved walks primary then alternates', () => {
    const m = { a: 'A', b: 'B' };
    const appFmt = (k) => m[k] || k;
    assert.strictEqual(appFmtResolved(appFmt, 'missing', 'a'), 'A');
    assert.strictEqual(appFmtResolved(appFmt, '', 'b'), 'B');
    assert.strictEqual(appFmtResolved(appFmt, 'z', 'y', 'b'), 'B');
    assert.strictEqual(appFmtResolved(appFmt, 'none'), '');
  });
});
