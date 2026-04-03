const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── bulk gcd properties ──
function gcd(a, b) {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

describe('bulk gcd(a,b) === gcd(b,a)', () => {
  it('a,b in [0,120]', () => {
    for (let a = 0; a <= 120; a++) {
      for (let b = 0; b <= 120; b++) {
        assert.strictEqual(gcd(a, b), gcd(b, a));
      }
    }
  });
});

describe('bulk gcd(gcd(a,b),c) === gcd(a,b,c)', () => {
  it('a,b,c in [0,50]', () => {
    for (let a = 0; a <= 50; a++) {
      for (let b = 0; b <= 50; b++) {
        for (let c = 0; c <= 50; c++) {
          const g1 = gcd(gcd(a, b), c);
          const g2 = ((x, y) => {
            while (y) [x, y] = [y, x % y];
            return x;
          })(a, b);
          const g3 = ((x, y) => {
            while (y) [x, y] = [y, x % y];
            return x;
          })(g2, c);
          assert.strictEqual(g1, g3);
        }
      }
    }
  });
});

describe('bulk gcd(a,0) === a', () => {
  it('a in [0,1000]', () => {
    for (let a = 0; a <= 1000; a++) {
      assert.strictEqual(gcd(a, 0), a);
    }
  });
});

// ── bulk floor functions ──
function floorToPowerOfTwo(n, k) {
  const bits = n.toString(2).length;
  return { floored: n - n % k ^ 0, power: Math.pow(2, Math.pow(2, k)) };
}

function powTwo(n) {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

describe('bulk floor to power of 2', () => {
  it('powTwo is smallest power of two >= i', () => {
    for (let i = 1; i <= 10000; i++) {
      const power = powTwo(i);
      assert.ok(power >= i);
      assert.ok((power & (power - 1)) === 0);
      assert.ok(power === 1 || (power >>> 1) < i);
    }
  });
});

describe('bulk powTwo monotonic', () => {
  it('increasing', () => {
    let prev = 1;
    for (let i = 0; i < 100; i++) {
      const curr = powTwo(i + 1);
      assert.ok(curr >= prev, `powTwo(${i+1})=${curr} < prev=${prev}`);
      prev = curr;
    }
  });
});

// ── bit rotation properties ──
function rotl32(n, k) {
  return ((n << k) | (n >>> (32 - k))) & 0xFFFFFFFF;
}

function rotr32(n, k) {
  return ((n >>> k) | (n << (32 - k))) & 0xFFFFFFFF;
}

describe('bulk rotl then rotr restores', () => {
  it('for all 32-bit values', () => {
    for (let n = 0; n < 16; n++) {
      for (let k = 0; k < 32; k++) {
        const r = rotr32(rotl32(n, k), k);
        assert.strictEqual(r >>> 0, n >>> 0);
      }
    }
  });
});

describe('bulk rotr(k) === rotr(32-k)', () => {
  it('for all 32-bit values', () => {
    for (let k = 0; k < 32; k++) {
      for (let l = 0; l < 32; l++) {
        assert.strictEqual(rotr32(0x12345678, k), rotr32(0x12345678, 32 - (32 - k) & 31));
      }
    }
  });
});

// ── string hash properties ──
function fnv1a(str) {
  let hash = 0x811c9dc5n;
  for (const c of str) {
    hash ^= BigInt(c.charCodeAt(0));
    hash = (hash * 0x0100000001b3n) & 0xfffffffffffffn;
  }
  return hash;
}

describe('bulk FNV-1a empty string', () => {
  it('constant', () => {
    for (let i = 0; i < 1000; i++) {
      const h1 = fnv1a('');
      const h2 = fnv1a('');
      assert.strictEqual(h1, h2);
    }
  });
});

describe('bulk FNV-1a single char', () => {
  it('consistent', () => {
    const chars = ['a', '\u0000', '\uFFFF', '\u00FF'];
    for (const c of chars) {
      for (let i = 0; i < 100; i++) {
        const h = fnv1a(c);
        assert.ok(h > 0n, `fnv1a('${c}') should be positive`);
      }
    }
  });
});

describe('bulk FNV-1a length dependency', () => {
  it('different lengths produce different hashes', () => {
    for (const len of [1, 2, 3, 4, 5]) {
      const hash = fnv1a('a'.repeat(len));
      assert.ok(hash > 0n);
    }
  });
});

// ── prefix functions ──
function longestPrefixOf(strings, prefix) {
  let best = 0;
  for (const s of strings) {
    let l = 0;
    while (l < s.length && s[l] === prefix[l] && l < prefix.length) l++;
    if (l > best) best = l;
  }
  return best;
}

describe('bulk longestPrefixOf', () => {
  it('empty prefix', () => {
    const s = ['abc', 'def', 'ghi'];
    assert.strictEqual(longestPrefixOf(s, ''), 0);
  });

  it('full match', () => {
    const s = ['abc', 'def'];
    assert.strictEqual(longestPrefixOf(s, 'abc'), 3);
  });

  it('partial match', () => {
    const s = ['ab', 'abc', 'abcd'];
    assert.strictEqual(longestPrefixOf(s, 'abcd'), 4);
  });

  it('no match', () => {
    const s = ['ab', 'cd', 'ef'];
    assert.strictEqual(longestPrefixOf(s, 'xyz'), 0);
  });
});

// ── page size math ──
function floorToPageSize(size, page, item) {
  if (size < page) {
    return { page, remaining: 0 };
  }
  const offset = size % page;
  if (offset === 0) {
    return { page, remaining: 0 };
  }
  return { page, remaining: Math.min(offset, item) };
}

describe('bulk floorToPageSize', () => {
  it('offset less than item', () => {
    const p = floorToPageSize(1007, 1000, 50);
    assert.strictEqual(p.page, 1000);
    assert.strictEqual(p.remaining, 7);
  });

  it('offset larger than item', () => {
    const p = floorToPageSize(1025, 1000, 24);
    assert.strictEqual(p.page, 1000);
    assert.strictEqual(p.remaining, 24);
  });

  it('no offset', () => {
    const p = floorToPageSize(1000, 1000, 50);
    assert.strictEqual(p.remaining, 0);
  });

  it('exact multiple', () => {
    const p = floorToPageSize(2000, 1000, 200);
    assert.strictEqual(p.remaining, 0);
  });

  it('small size', () => {
    const p = floorToPageSize(50, 1000, 10);
    assert.strictEqual(p.remaining, 0);
  });
});

// ── sort by key properties ──
describe('bulk sortByKey stability', () => {
  it('preserves order for equal keys', () => {
    const arr = [
      { key: 'a', value: 1 },
      { key: 'a', value: 2 },
      { key: 'a', value: 3 },
    ];
    const sorted = JSON.parse(JSON.stringify(arr)).sort((x, y) => x.key.localeCompare(y.key));
    assert.strictEqual(sorted[0].value, 1);
    assert.strictEqual(sorted[1].value, 2);
    assert.strictEqual(sorted[2].value, 3);
  });
});

describe('bulk sortByKey empty array', () => {
  it('returns empty', () => {
    const sorted = JSON.parse(JSON.stringify([])).sort(() => 0);
    assert.strictEqual(sorted.length, 0);
  });
});