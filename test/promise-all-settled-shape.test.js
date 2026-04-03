const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('Promise.allSettled', () => {
  it('mixed outcomes', async () => {
    const r = await Promise.allSettled([Promise.resolve(1), Promise.reject(new Error('x'))]);
    assert.strictEqual(r[0].status, 'fulfilled');
    assert.strictEqual(r[1].status, 'rejected');
  });
});
