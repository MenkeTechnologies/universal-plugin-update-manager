const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// When an event fires at time t, next allowed fire is t + waitMs (leading-edge debounce window end)
function nextAllowedFire(lastFire, now, waitMs) {
  const deadline = lastFire + waitMs;
  return now >= deadline ? now : deadline;
}

describe('nextAllowedFire', () => {
  it('immediate if past window', () => assert.strictEqual(nextAllowedFire(0, 100, 50), 100));
  it('delayed if inside window', () => assert.strictEqual(nextAllowedFire(100, 120, 50), 150));
});
