const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('uuid v4 regex', () => {
  it('valid', () =>
    assert.strictEqual(UUID_V4.test('550e8400-e29b-41d4-a716-446655440000'), true));
  it('wrong version', () =>
    assert.strictEqual(UUID_V4.test('550e8400-e29b-31d4-a716-446655440000'), false));
});
