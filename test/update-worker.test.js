const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Test version comparison and parsing logic used by the update worker

describe('version utils', () => {
  function parseVersion(ver) {
    if (!ver || ver === 'Unknown') return [0, 0, 0];
    return ver.split('.').map(n => parseInt(n, 10) || 0);
  }

  function compareVersions(a, b) {
    const pa = parseVersion(a);
    const pb = parseVersion(b);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const diff = (pa[i] || 0) - (pb[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  describe('parseVersion', () => {
    it('parses standard version', () => {
      assert.deepStrictEqual(parseVersion('1.2.3'), [1, 2, 3]);
    });

    it('parses two-part version', () => {
      assert.deepStrictEqual(parseVersion('3.5'), [3, 5]);
    });

    it('parses four-part version', () => {
      assert.deepStrictEqual(parseVersion('1.2.3.4'), [1, 2, 3, 4]);
    });

    it('returns [0,0,0] for Unknown', () => {
      assert.deepStrictEqual(parseVersion('Unknown'), [0, 0, 0]);
    });

    it('returns [0,0,0] for null', () => {
      assert.deepStrictEqual(parseVersion(null), [0, 0, 0]);
    });
  });

  describe('compareVersions', () => {
    it('equal versions return 0', () => {
      assert.strictEqual(compareVersions('1.2.3', '1.2.3'), 0);
    });

    it('higher major is positive', () => {
      assert.ok(compareVersions('2.0.0', '1.0.0') > 0);
    });

    it('lower major is negative', () => {
      assert.ok(compareVersions('1.0.0', '2.0.0') < 0);
    });

    it('higher minor is positive', () => {
      assert.ok(compareVersions('1.3.0', '1.2.0') > 0);
    });

    it('higher patch is positive', () => {
      assert.ok(compareVersions('1.2.4', '1.2.3') > 0);
    });

    it('handles different length versions', () => {
      assert.ok(compareVersions('1.2.3.1', '1.2.3') > 0);
      assert.strictEqual(compareVersions('1.2.3.0', '1.2.3'), 0);
    });

    it('handles Unknown as 0.0.0', () => {
      assert.ok(compareVersions('1.0.0', 'Unknown') > 0);
      assert.ok(compareVersions('Unknown', '1.0.0') < 0);
    });
  });
});

describe('KVR URL builder', () => {
  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function buildKvrUrl(name, manufacturer) {
    const slug = slugify(name);
    if (manufacturer && manufacturer !== 'Unknown') {
      return `https://www.kvraudio.com/product/${slug}-by-${slugify(manufacturer)}`;
    }
    return `https://www.kvraudio.com/product/${slug}`;
  }

  it('builds URL with manufacturer', () => {
    assert.strictEqual(
      buildKvrUrl('Pro-Q 3', 'FabFilter'),
      'https://www.kvraudio.com/product/pro-q-3-by-fabfilter'
    );
  });

  it('builds URL for ADSR Sample Manager', () => {
    assert.strictEqual(
      buildKvrUrl('ADSR Sample Manager', 'ADSR'),
      'https://www.kvraudio.com/product/adsr-sample-manager-by-adsr'
    );
  });

  it('builds URL for 2RuleSynth', () => {
    assert.strictEqual(
      buildKvrUrl('2RuleSynth', '2Rule'),
      'https://www.kvraudio.com/product/2rulesynth-by-2rule'
    );
  });

  it('builds URL without manufacturer', () => {
    assert.strictEqual(
      buildKvrUrl('SomePlugin', 'Unknown'),
      'https://www.kvraudio.com/product/someplugin'
    );
  });

  it('handles special characters', () => {
    assert.strictEqual(
      buildKvrUrl('Plugin (v2) [Beta]', 'My Co.'),
      'https://www.kvraudio.com/product/plugin-v2-beta-by-my-co'
    );
  });
});
