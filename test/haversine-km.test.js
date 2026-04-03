const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const R = 6371; // km

function haversineKm(lat1, lon1, lat2, lon2) {
  const toR = x => (x * Math.PI) / 180;
  const dLat = toR(lat2 - lat1);
  const dLon = toR(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

describe('haversineKm', () => {
  it('same point', () => assert.ok(haversineKm(40, -74, 40, -74) < 1));
});
