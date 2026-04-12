/**
 * Mirrors pure helpers in frontend/js/native-file-drag.js.
 * MUST stay in sync with: hexToRgba, strokeRoundRect, pathsWithBatch, drawCornerTicks.
 */
const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');

function hexToRgba(hex, a) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return `rgba(5, 217, 232, ${a})`;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

function strokeRoundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, rr);
    return;
  }
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

function pathsWithBatch(primaryPath) {
  if (typeof getActiveBatchSet !== 'function') return [primaryPath];
  const set = getActiveBatchSet();
  if (!set || set.size === 0 || !set.has(primaryPath)) return [primaryPath];
  return [...set];
}

function drawCornerTicks(ctx, x, y, w, h, c1, c2) {
  const L = 12;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = c1;
  ctx.beginPath();
  ctx.moveTo(x, y + L);
  ctx.lineTo(x, y);
  ctx.lineTo(x + L, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w - L, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + L);
  ctx.stroke();
  ctx.strokeStyle = c2;
  ctx.beginPath();
  ctx.moveTo(x, y + h - L);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + L, y + h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w - L, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - L);
  ctx.stroke();
}

describe('native-file-drag pure mirrors', () => {
  afterEach(() => {
    delete global.getActiveBatchSet;
  });

  describe('hexToRgba', () => {
    it('parses #RRGGBB and optional hash', () => {
      assert.strictEqual(hexToRgba('#0102ef', 0.25), 'rgba(1,2,239,0.25)');
      assert.strictEqual(hexToRgba('abcdef', 1), 'rgba(171,205,239,1)');
    });

    it('accepts leading/trailing whitespace on hex', () => {
      assert.strictEqual(hexToRgba('  #ff00aa  ', 0), 'rgba(255,0,170,0)');
    });

    it('uses default cyan channels when pattern does not match', () => {
      assert.strictEqual(hexToRgba('#fff', 0.4), 'rgba(5, 217, 232, 0.4)');
      assert.strictEqual(hexToRgba('not-a-color', 0.1), 'rgba(5, 217, 232, 0.1)');
      assert.strictEqual(hexToRgba('#gg0000', 1), 'rgba(5, 217, 232, 1)');
    });
  });

  describe('strokeRoundRect', () => {
    it('delegates to ctx.roundRect with clamped radius', () => {
      let called = null;
      const ctx = {
        beginPath() {},
        roundRect(x, y, w, h, rr) {
          called = { x, y, w, h, rr };
        },
        moveTo() {
          throw new Error('fallback path should not run');
        },
      };
      strokeRoundRect(ctx, 2, 3, 100, 40, 999);
      assert.deepStrictEqual(called, { x: 2, y: 3, w: 100, h: 40, rr: 20 });
    });

    it('polyfills path when roundRect is absent', () => {
      const ops = [];
      const ctx = {
        beginPath() {
          ops.push('beginPath');
        },
        moveTo(x, y) {
          ops.push(['moveTo', x, y]);
        },
        lineTo(x, y) {
          ops.push(['lineTo', x, y]);
        },
        arcTo(a, b, c, d, e) {
          ops.push(['arcTo', a, b, c, d, e]);
        },
        closePath() {
          ops.push('closePath');
        },
      };
      strokeRoundRect(ctx, 0, 0, 24, 16, 4);
      assert.strictEqual(ops[0], 'beginPath');
      assert.strictEqual(ops[ops.length - 1], 'closePath');
      assert.ok(ops.some((o) => Array.isArray(o) && o[0] === 'arcTo'));
    });
  });

  describe('pathsWithBatch', () => {
    it('returns singleton when getActiveBatchSet is missing', () => {
      assert.deepStrictEqual(pathsWithBatch('/only.wav'), ['/only.wav']);
    });

    it('returns singleton when batch empty or primary not selected', () => {
      global.getActiveBatchSet = () => new Set();
      assert.deepStrictEqual(pathsWithBatch('/a.wav'), ['/a.wav']);
      global.getActiveBatchSet = () => new Set(['/b.wav']);
      assert.deepStrictEqual(pathsWithBatch('/a.wav'), ['/a.wav']);
    });

    it('expands to full Set iteration order when primary is in batch', () => {
      global.getActiveBatchSet = () => new Set(['/z.wav', '/a.wav']);
      assert.deepStrictEqual(pathsWithBatch('/a.wav'), ['/z.wav', '/a.wav']);
    });
  });

  describe('drawCornerTicks', () => {
    it('uses c1 for first two corners then c2 for last two (two strokeStyle assigns)', () => {
      const events = [];
      const ctx = {
        set lineWidth(v) {
          events.push(['lineWidth', v]);
        },
        set strokeStyle(v) {
          events.push(['strokeStyle', v]);
        },
        beginPath() {
          events.push('beginPath');
        },
        moveTo() {
          events.push('moveTo');
        },
        lineTo() {
          events.push('lineTo');
        },
        stroke() {
          events.push('stroke');
        },
      };
      drawCornerTicks(ctx, 10, 20, 200, 100, '#c0', '#c1');
      assert.strictEqual(events.filter((e) => e === 'stroke').length, 4);
      assert.strictEqual(events.filter((e) => e === 'beginPath').length, 4);
      const styles = events.filter((e) => Array.isArray(e) && e[0] === 'strokeStyle').map((e) => e[1]);
      assert.deepStrictEqual(styles, ['#c0', '#c1']);
    });
  });
});
