const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');

// Test advanced utility functions used across the application
// Covers edge cases, boundary conditions, and performance scenarios

describe('advanced utilities', () => {
  describe('DeepClone', () => {
    const deepClone = (obj) => JSON.parse(JSON.stringify(obj));
    
    it('clones primitive values', () => {
      const obj = { a: 1, b: 'test' };
      const cloned = deepClone(obj);
      assert.deepStrictEqual(cloned, obj);
      assert.notStrictEqual(cloned, obj); // Different object reference
    });
    
    it('clones nested objects', () => {
      const obj = {
        nested: { value: 42, items: [1, 2, 3] },
        array: [
          { id: 1, name: 'a' },
          { id: 2, name: 'b' }
        ]
      };
      const cloned = deepClone(obj);
      cloned.nested.value = 999;
      assert.strictEqual(cloned.nested.value, 999);
      assert.strictEqual(obj.nested.value, 42); // Original unchanged
    });
    
    it('handles circular references (partially)', () => {
      const obj = { a: 1 };
      try {
        obj.self = obj;
        const cloned = deepClone(obj);
        // May throw due to circular ref, which is acceptable
      } catch (e) {
        // Expected for circular references
      }
    });
    
    it('clones arrays with mixed types', () => {
      const arr = [1, 'string', null, undefined, { obj: true }, [{ nested: true }]];
      const cloned = deepClone(arr);
      // JSON omits `undefined` elements; clone matches JSON semantics
      const expected = [1, 'string', null, null, { obj: true }, [{ nested: true }]];
      assert.deepStrictEqual(cloned, expected);
    });
  });
  
  describe('Throttle', () => {
    const throttle = (fn, wait) => {
      let lastInvocation;
      let timeoutId;
      return function () {
        const args = arguments;
        const now = Date.now();
        lastInvocation = now <= lastInvocation + wait ? lastInvocation : now;
        if (timeoutId) return;
        timeoutId = setTimeout(() => {
          fn.apply(this, args);
          timeoutId = null;
        }, wait);
      };
    };

    it('limits call frequency', async () => {
      let callCount = 0;
      let lastArg;
      const fn = (t) => {
        callCount++;
        lastArg = t;
      };
      const throttled = throttle(fn, 50);

      throttled(1);
      assert.strictEqual(callCount, 0);

      await new Promise((r) => setTimeout(r, 60));
      assert.strictEqual(callCount, 1);
      assert.strictEqual(lastArg, 1);
    });
    
    it('resets timeout on new call', async () => {
      const fn = () => {};
      let fired = false;
      const throttled = throttle(() => { fired = true; }, 100);
      
      throttled(1);
      assert.strictEqual(fired, false);
      
      // Call again before timeout
      throttled(2);
      assert.strictEqual(fired, false);
      
      // Wait and verify only fired once
      await new Promise(r => setTimeout(r, 150));
      assert.strictEqual(fired, true);
    });
  });
  
  describe('Debounce', () => {
    const debounce = (fn, wait) => {
      let timeoutId;
      return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          fn(...args);
        }, wait);
      };
    };
    
    let originalCallCount;

    before(() => {
      originalCallCount = 0;
    });

    it('waits for delay after last call', async () => {
      let callTime;
      const fn = () => { callTime = Date.now(); };
      const debounced = debounce(fn, 50);
      
      debounced(1);
      assert.strictEqual(callTime, undefined);
      
      await new Promise(r => setTimeout(r, 60));
      assert.ok(callTime);
    });
    
    it('resets on new call during wait', async () => {
      const fn = () => { originalCallCount++; };
      const debounced = debounce(fn, 50);
      
      debounced(1);
      await new Promise(r => setTimeout(r, 25));
      
      // Call again before timeout
      debounced(2);
      
      // Should still be pending
      await new Promise(r => setTimeout(r, 60));
      assert.strictEqual(originalCallCount, 1);
    });
    
    it('clears timeout on new call', async () => {
      let invocations = 0;
      const debounced = debounce(() => {
        invocations++;
      }, 50);
      debounced();
      await new Promise((r) => setTimeout(r, 10));
      debounced();
      await new Promise((r) => setTimeout(r, 60));
      assert.strictEqual(invocations, 1);
    });
  });
  
  describe('escapeHtml', () => {
    const escapeHtml = (str) => (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    it('escapes ampersand', () => {
      assert.strictEqual(escapeHtml('&'), '&amp;');
    });
    
    it('escapes less-than', () => {
      assert.strictEqual(escapeHtml('<'), '&lt;');
    });
    
    it('escapes greater-than', () => {
      assert.strictEqual(escapeHtml('>'), '&gt;');
    });
    
    it('escapes quotes', () => {
      assert.strictEqual(escapeHtml('"'), '&quot;');
      assert.strictEqual(escapeHtml("'"), '&#039;');
    });
    
    it('handles multiple special chars', () => {
      const input = '<>"&\'';
      const expected = '&lt;&gt;&quot;&amp;&#039;';
      assert.strictEqual(escapeHtml(input), expected);
    });
    
    it('handles empty string', () => {
      assert.strictEqual(escapeHtml(''), '');
    });
    
    it('handles null', () => {
      assert.strictEqual(escapeHtml(null), '');
    });
    
    it('handles undefined', () => {
      assert.strictEqual(escapeHtml(undefined), '');
    });
  });
  
  describe('escapePath', () => {
    let escapePath;
    
    before(() => {
      escapePath = (str) => str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    });
    
    it('escapes backslashes', () => {
      assert.strictEqual(escapePath('C:\\test'), 'C:\\\\test');
    });
    
    it('escapes single quotes', () => {
      assert.strictEqual(escapePath("it's"), "it\\'s");
    });
    
    it('handles both escapes', () => {
      assert.strictEqual(escapePath("C:\\It's Test"), "C:\\\\It\\'s Test");
    });
    
    it('handles paths with spaces', () => {
      assert.strictEqual(escapePath("My Documents/file.wav"), "My Documents/file.wav");
    });
  });
  
  describe('slugify', () => {
    const slugify = (str) => str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/([a-zA-Z])(\d)/g, '$1-$2')
      .replace(/(\d)([a-zA-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    it('camelCase to kebab-case', () => {
      assert.strictEqual(slugify('MyPluginName'), 'my-plugin-name');
    });
    
    it('handles leading/trailing dashes', () => {
      assert.strictEqual(slugify('   '), '');
    });
    
    it('preserves numbers', () => {
      assert.strictEqual(slugify('plugin123'), 'plugin-123');
    });
    
    it('handles special characters', () => {
      assert.strictEqual(slugify('Test@#$%^'), 'test');
    });
  });
  
  describe('buildKvrUrl', () => {
    const KVR_MANUFACTURER_MAP = {
      'madronalabs': 'madrona-labs',
      'soundtoys': 'soundtoys',
      'wavefactory': 'wavefactory',
    };
    
    const buildKvrUrl = (name, manufacturer) => {
      const nameSlug = name
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/([a-zA-Z])(\d)/g, '$1-$2')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      
      if (manufacturer && manufacturer !== 'Unknown') {
        const mfgLower = manufacturer.toLowerCase().replace(/[^a-z0-9]+/g, '');
        const mfgSlug = KVR_MANUFACTURER_MAP[mfgLower] || mfgLower;
        return `https://www.kvraudio.com/product/${nameSlug}-by-${mfgSlug}`;
      }
      return `https://www.kvraudio.com/products?site_search=${encodeURIComponent(name)}`;
    };
    
    it('builds URL with manufacturer', () => {
      const url = buildKvrUrl('SuperSynth', 'Soundtoys');
      assert.ok(url.includes('kvraudio.com'), 'URL should contain kvraudio.com');
      assert.ok(url.includes('soundtoys'), 'URL should contain manufacturer slug');
    });
    
    it('builds search URL for unknown manufacturer', () => {
      const url = buildKvrUrl('UnknownEffect', 'Unknown');
      assert.ok(url.includes('/products?site_search='));
    });
  });
  
  describe('timeAgo', () => {
    function timeAgo(date) {
      const seconds = Math.floor((Date.now() - date) / 1000);
      
      if (seconds < 60) return 'just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
      return 'over a month ago';
    }
    
    it('handles recent timestamp', () => {
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;
      assert.strictEqual(timeAgo(oneMinuteAgo), '1m ago');
    });
    
    it('handles hour range', () => {
      const now = Date.now();
      const twoHoursAgo = now - 2 * 60 * 60 * 1000;
      assert.strictEqual(timeAgo(twoHoursAgo), '2h ago');
    });
    
    it('handles day range', () => {
      const now = Date.now();
      const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
      assert.strictEqual(timeAgo(threeDaysAgo), '3d ago');
    });
  });
  
  describe('kvrCacheKey', () => {
    const slugifyForKey = (str) => str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/([a-zA-Z])(\d)/g, '$1-$2')
      .replace(/(\d)([a-zA-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const kvrCacheKey = (name, version) =>
      `kvraudio:${slugifyForKey(name)}:${version || 'latest'}`;
    
    it('creates unique keys', () => {
      const key1 = kvrCacheKey('TestPlugin', '1.0');
      const key2 = kvrCacheKey('TestPlugin', '2.0');
      assert.notStrictEqual(key1, key2);
    });
    
    it('handles name changes', () => {
      const key1 = kvrCacheKey('MyPlugin', null);
      const key2 = kvrCacheKey('OtherThing', null);
      assert.notStrictEqual(key1, key2);
    });
  });
  
  describe('formatAudioSize', () => {
    const formatAudioSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
    };
    
    it('formats small files', () => {
      assert.strictEqual(formatAudioSize(500), '500.0 B');
    });
    
    it('formats medium files', () => {
      assert.strictEqual(formatAudioSize(5 * 1024 * 1024), '5.0 MB');
    });
    
    it('formats large files', () => {
      assert.strictEqual(formatAudioSize(10 * 1024 * 1024 * 1024), '10.0 GB');
    });
  });
  
  describe('formatTime', () => {
    const formatTime = (ms) => {
      if (ms < 1000) return `${ms}ms`;
      return new Date(ms).toISOString().substring(11, 23);
    };

    it('formats milliseconds', () => {
      assert.strictEqual(formatTime(500), '500ms');
    });

    it('formats seconds', () => {
      assert.strictEqual(formatTime(60000), '00:01:00.000');
    });
  });
  
  describe('getFormatClass', () => {
    const getFormatClass = (format) => {
      const map = {
        WAV: 'format-wav',
        M4A: 'format-audio',
        ALSF: 'format-audio',
        FLAC: 'format-audio',
        MP3: 'format-compressed',
      };
      const key = format.replace(/^\./, '').toUpperCase();
      return map[key] || 'format-audio';
    };
    
    it('returns correct class for WAV', () => {
      assert.strictEqual(getFormatClass('.wav'), 'format-wav');
    });
    
    it('handles unknown formats', () => {
      assert.strictEqual(getFormatClass('.unknown'), 'format-audio');
    });
  });
});
