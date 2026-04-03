const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/drag-reorder.js: drag starts after 3px move ──
function shouldStartDrag(dx, dy, direction) {
  const d = direction === 'horizontal' ? dx : dy;
  return Math.abs(d) > 3;
}

describe('drag dead zone', () => {
  it('no drag at 3px or less', () => {
    assert.strictEqual(shouldStartDrag(3, 0, 'horizontal'), false);
    assert.strictEqual(shouldStartDrag(0, 3, 'vertical'), false);
  });

  it('drag after 4px', () => {
    assert.strictEqual(shouldStartDrag(4, 0, 'horizontal'), true);
    assert.strictEqual(shouldStartDrag(0, -5, 'vertical'), true);
  });
});
