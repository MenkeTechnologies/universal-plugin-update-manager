const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function totalPages(totalItems, pageSize) {
  if (pageSize <= 0) return 0;
  return Math.ceil(totalItems / pageSize);
}

function hasNextPage(offset, limit, totalCount) {
  return offset + limit < totalCount;
}

function clampOffset(offset, totalCount, limit) {
  if (totalCount <= 0) return 0;
  const maxOff = Math.max(0, totalCount - limit);
  return Math.max(0, Math.min(offset, maxOff));
}

describe('totalPages', () => {
  it('ceil division', () => {
    assert.strictEqual(totalPages(100, 25), 4);
    assert.strictEqual(totalPages(101, 25), 5);
    assert.strictEqual(totalPages(0, 25), 0);
  });

  it('zero page size', () => {
    assert.strictEqual(totalPages(10, 0), 0);
  });
});

describe('hasNextPage', () => {
  it('false on last page', () => {
    assert.strictEqual(hasNextPage(500, 500, 1000), false);
  });

  it('true when more rows', () => {
    assert.strictEqual(hasNextPage(0, 500, 2000), true);
  });
});

describe('clampOffset', () => {
  it('clamps past end', () => {
    assert.strictEqual(clampOffset(9000, 1000, 500), 500);
  });

  it('zero total', () => {
    assert.strictEqual(clampOffset(5, 0, 100), 0);
  });
});
