const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Test data transformation and utility functions used throughout the app
// These are tested in isolation without the full Tauri stack

describe('data transformations', () => {
  describe('arrayChunk', () => {
    const arrayChunk = (arr, size) => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };
    
    it('chunks array correctly', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const chunks = arrayChunk(arr, 3);
      assert.strictEqual(chunks.length, 4);
      assert.deepStrictEqual(chunks[0], [1, 2, 3]);
      assert.deepStrictEqual(chunks[3], [10]);
    });
    
    it('handles empty array', () => {
      const arr = [];
      const chunks = arrayChunk(arr, 3);
      assert.deepStrictEqual(chunks, []);
    });
    
    it('handles size larger than array', () => {
      const arr = [1, 2];
      const chunks = arrayChunk(arr, 10);
      assert.deepStrictEqual(chunks, [[1, 2]]);
    });
  });
  
  describe('flattenDepth', () => {
    const flattenDepth = (arr, depth = 1) => {
      let flat = [];
      arr.forEach(item => {
        if (Array.isArray(item) && depth > 0) {
          flat = flat.concat(flattenDepth(item, depth - 1));
        } else {
          flat.push(item);
        }
      });
      return flat;
    };
    
    it('flattens one level', () => {
      const arr = [[1, 2], [3, [4, 5]], 6];
      const flat = flattenDepth(arr, 1);
      assert.deepStrictEqual(flat, [1, 2, 3, [4, 5], 6]);
    });

    it('handles nested arrays of varying depth', () => {
      const arr = [1, [2, [3, [4, [5, [6]]]]]];
      assert.deepStrictEqual(flattenDepth(arr, 1), [1, 2, [3, [4, [5, [6]]]]]);
      assert.deepStrictEqual(flattenDepth(arr, 2), [1, 2, 3, [4, [5, [6]]]]);
      assert.deepStrictEqual(flattenDepth(arr, 3), [1, 2, 3, 4, [5, [6]]]);
      assert.deepStrictEqual(flattenDepth(arr, 4), [1, 2, 3, 4, 5, [6]]);
    });
    
    it('handles empty arrays', () => {
      const arr = [];
      assert.deepStrictEqual(flattenDepth(arr, 1), []);
    });
    
    it('handles mixed arrays', () => {
      const arr = [1, 'string', [2, 'string2'], [3, [4, 'string3']]];
      const flat = flattenDepth(arr, 1);
      assert.strictEqual(flat.length, 6);
      assert.deepStrictEqual(flat, [1, 'string', 2, 'string2', 3, [4, 'string3']]);
    });
  });
  
  describe('arraySort', () => {
    const arraySort = (arr, keyFn) => [...arr].sort((a, b) => {
      return keyFn(a) < keyFn(b) ? -1 : 1;
    });
    
    it('sorts by number', () => {
      const arr = [3, 1, 2];
      const sorted = arraySort(arr, x => x);
      assert.deepStrictEqual(sorted, [1, 2, 3]);
    });
    
    it('sorts by string', () => {
      const arr = ['banana', 'apple', 'cherry'];
      const sorted = arraySort(arr, x => x);
      assert.deepStrictEqual(sorted, ['apple', 'banana', 'cherry']);
    });
    
    it('sorts by date', () => {
      const arr = ['2024-01-03', '2024-01-01', '2024-01-02'];
      const sorted = arraySort(arr, x => x);
      assert.deepStrictEqual(sorted, [
        '2024-01-01', '2024-01-02', '2024-01-03'
      ]);
    });
    
    it('handles descending order', () => {
      const arr = [1, 2, 3];
      const sorted = arraySort(arr, x => -x);
      assert.deepStrictEqual(sorted, [3, 2, 1]);
    });
    
    it('handles empty array', () => {
      const arr = [];
      const sorted = arraySort(arr, x => x);
      assert.deepStrictEqual(sorted, []);
    });
  });
  
  describe('objectFilter', () => {
    const objectFilter = (arr, key, value) => arr.filter(item => item[key] === value);
    
    it('filters by single value', () => {
      const arr = [
        { name: 'apple', size: 'small', price: 1 },
        { name: 'banana', size: 'small', price: 2 },
        { name: 'cherry', size: 'large', price: 3 },
      ];
      
      const filtered = objectFilter(arr, 'size', 'small');
      assert.strictEqual(filtered.length, 2);
      assert.strictEqual(filtered[0].name, 'apple');
      assert.strictEqual(filtered[1].name, 'banana');
    });
    
    it('returns empty array for no match', () => {
      const arr = [
        { name: 'apple', size: 'small', price: 1 },
        { name: 'banana', size: 'medium', price: 2 },
      ];
      
      const filtered = objectFilter(arr, 'size', 'large');
      assert.deepStrictEqual(filtered, []);
    });
    
    it('handles empty input array', () => {
      const filtered = objectFilter([], 'name', 'fruit');
      assert.deepStrictEqual(filtered, []);
    });
  });
  
  describe('stringContainsIgnoreCase', () => {
    const stringContainsIgnoreCase = (haystack, needle) => {
      return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };
    
    it('finds needle in haystack', () => {
      assert.strictEqual(stringContainsIgnoreCase('Hello World', 'world'), true);
    });
    
    it('handles case sensitivity', () => {
      assert.strictEqual(stringContainsIgnoreCase('Hello World', 'WORLD'), true);
    });
    
    it('handles exact match', () => {
      assert.strictEqual(stringContainsIgnoreCase('Test', 'test'), true);
    });
    
    it('handles no match', () => {
      assert.strictEqual(stringContainsIgnoreCase('Test', 'other'), false);
    });
    
    it('handles empty needle', () => {
      assert.strictEqual(stringContainsIgnoreCase('Test', ''), true);
    });
  });
  
  describe('stringReplaceAll', () => {
    const stringReplaceAll = (str, old, newStr) => str.split(old).join(newStr);
    
    it('replaces all occurrences', () => {
      const result = stringReplaceAll('foo-bar-foo', '-', '--');
      assert.strictEqual(result, 'foo--bar--foo');
    });
    
    it('handles no occurrences', () => {
      const result = stringReplaceAll('foobar', 'xyz', 'replaced');
      assert.strictEqual(result, 'foobar');
    });
    
    it('replaces empty string', () => {
      const result = stringReplaceAll('foobar', 'foobar', 'x');
      assert.strictEqual(result, 'x');
    });
  });
  
  describe('stringSubstrBefore', () => {
    const stringSubstrBefore = (str, separator) => {
      const index = str.indexOf(separator);
      return index === -1 ? str : str.substring(0, index);
    };
    
    it('extracts before separator', () => {
      assert.strictEqual(stringSubstrBefore('path/file.wav', '/'), 'path');
    });
    
    it('handles no separator', () => {
      assert.strictEqual(stringSubstrBefore('file.wav', '/'), 'file.wav');
    });
  });
  
  describe('stringSubstrAfter', () => {
    const stringSubstrAfter = (str, separator) => {
      const index = str.indexOf(separator);
      return index === -1 ? '' : str.substring(index + separator.length);
    };
    
    it('extracts after separator', () => {
      assert.strictEqual(stringSubstrAfter('file=extension', '='), 'extension');
    });
    
    it('handles no separator', () => {
      assert.strictEqual(stringSubstrAfter('file.wav', '='), '');
    });
  });
  
  describe('stringTrim', () => {
    const stringTrim = (str) => str.trim();
    
    it('removes leading and trailing whitespace', () => {
      const result = stringTrim('  hello world  ');
      assert.strictEqual(result, 'hello world');
    });
    
    it('handles tabs and newlines', () => {
      const result = stringTrim('\t\nhello\t\n');
      assert.strictEqual(result, 'hello');
    });
    
    it('handles empty string', () => {
      assert.strictEqual(stringTrim(''), '');
    });
  });
  
  describe('stringSlugify', () => {
    const stringSlugify = (str) => str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    it('converts spaces to dashes', () => {
      assert.strictEqual(stringSlugify('My Plugin Name'), 'my-plugin-name');
    });
    
    it('handles special characters', () => {
      assert.strictEqual(stringSlugify(':special:chars'), 'special-chars');
    });
    
    it('normalizes multiple dashes', () => {
      assert.strictEqual(stringSlugify('A---B'), 'a-b');
    });

    it('handles leading/trailing dashes', () => {
      assert.strictEqual(stringSlugify('--Start'), 'start');
      assert.strictEqual(stringSlugify('End--'), 'end');
    });
  });
  
  describe('booleanFromNumber', () => {
    const booleanFromNumber = (n) => (n === 1);
    
    it('handles 1', () => {
      assert.strictEqual(booleanFromNumber(1), true);
    });
    
    it('handles 0', () => {
      assert.strictEqual(booleanFromNumber(0), false);
    });
    
    it('handles other values', () => {
      assert.strictEqual(booleanFromNumber(-1), false);
      assert.strictEqual(booleanFromNumber(2), false);
    });
  });
  
  describe('numberRound', () => {
    const numberRound = (n, decimals = 0) => {
      const factor = Math.pow(10, decimals);
      return Math.round(n * factor) / factor;
    };
    
    it('rounds to integers', () => {
      assert.strictEqual(numberRound(3.7), 4);
      assert.strictEqual(numberRound(3.2), 3);
      assert.strictEqual(numberRound(3.5), 4); // Round up
    });
    
    it('rounds to decimals', () => {
      assert.strictEqual(numberRound(3.14159, 2), 3.14);
      assert.strictEqual(numberRound(3.14159, 3), 3.142);
    });
    
    it('handles negative numbers', () => {
      assert.strictEqual(numberRound(-3.5), -3);
      assert.strictEqual(numberRound(-3.2), -3);
    });
  });
  
  describe('numberMin', () => {
    const numberMin = (...nums) => Math.min(...nums);
    
    it('handles two numbers', () => {
      assert.strictEqual(numberMin(5, 3), 3);
    });
    
    it('handles multiple numbers', () => {
      assert.strictEqual(numberMin(5, 3, 8, 2, 9), 2);
    });
    
    it('handles empty array', () => {
      assert.strictEqual(numberMin(), Infinity);
    });
  });
  
  describe('numberMax', () => {
    const numberMax = (...nums) => Math.max(...nums);
    
    it('handles two numbers', () => {
      assert.strictEqual(numberMax(5, 3), 5);
    });
    
    it('handles multiple numbers', () => {
      assert.strictEqual(numberMax(5, 3, 8, 2, 9), 9);
    });
    
    it('handles empty array', () => {
      assert.strictEqual(numberMax(), -Infinity);
    });
  });
});
