const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

class Trie {
  constructor() {
    this.root = { c: {}, end: false };
  }
  insert(s) {
    let n = this.root;
    for (const ch of s) {
      if (!n.c[ch]) n.c[ch] = { c: {}, end: false };
      n = n.c[ch];
    }
    n.end = true;
  }
  hasPrefix(s) {
    let n = this.root;
    for (const ch of s) {
      if (!n.c[ch]) return false;
      n = n.c[ch];
    }
    return true;
  }
}

describe('Trie', () => {
  it('prefix', () => {
    const t = new Trie();
    t.insert('hello');
    assert.strictEqual(t.hasPrefix('hel'), true);
    assert.strictEqual(t.hasPrefix('hex'), false);
  });
});
