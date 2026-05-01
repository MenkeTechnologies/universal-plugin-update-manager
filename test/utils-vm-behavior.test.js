/**
 * Behavioral tests against real frontend/js/utils.js (vm-loaded).
 * Covers search scoring, fzf parsing, formatters, slugify, findByPath, highlight.
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { loadFrontendScripts, defaultDocument } = require('./frontend-vm-harness.js');

describe('frontend/js/utils.js (vm-loaded)', () => {
  let U;

  before(() => {
    U = loadFrontendScripts(['utils.js'], { document: defaultDocument() });
  });

  describe('parseFzfQuery', () => {
    it('empty and whitespace-only yield no groups', () => {
      const a = U.parseFzfQuery('');
      const b = U.parseFzfQuery('   ');
      assert.strictEqual(a.length, 0);
      assert.strictEqual(b.length, 0);
    });

    it('AND groups from spaces', () => {
      const g = U.parseFzfQuery('alpha beta');
      assert.strictEqual(g.length, 2);
      assert.strictEqual(g[0][0].text, 'alpha');
      assert.strictEqual(g[1][0].text, 'beta');
    });

    it('pipe-with-space splits groups (| b)', () => {
      const g = U.parseFzfQuery('a | b');
      assert.strictEqual(g.length, 2);
    });

    it('OR inside group via leading pipe on token', () => {
      const g = U.parseFzfQuery('|serum |massive');
      assert.strictEqual(g.length, 1);
      assert.strictEqual(g[0].length, 2);
    });
  });

  describe('parseToken', () => {
    it('single-quoted exact', () => {
      const t = U.parseToken("'foo bar'");
      assert.strictEqual(t.type, 'exact');
      assert.strictEqual(t.text, 'foo bar');
      assert.strictEqual(t.negate, false);
    });
  });

  describe('searchScore (fuzzy)', () => {
    it('empty query matches everything', () => {
      assert.strictEqual(U.searchScore('', ['x'], 'fuzzy'), 1);
    });

    it('exact name scores higher than fuzzy-only on second field', () => {
      const sName = U.searchScore('Serum', ['Serum', 'other'], 'fuzzy');
      const sPath = U.searchScore('Serum', ['other', 'Serum'], 'fuzzy');
      assert.ok(sName > 0);
      assert.ok(sPath > 0);
      assert.ok(sName > sPath);
    });

    it('AND across space-separated groups', () => {
      assert.ok(U.searchScore('serum vst', ['Xfer Serum VST3'], 'fuzzy') > 0);
      assert.strictEqual(U.searchScore('serum missingtoken', ['Xfer Serum', ''], 'fuzzy'), 0);
    });

    it('negated term fails when present', () => {
      assert.strictEqual(U.searchScore('!bad', ['badplugin'], 'fuzzy'), 0);
      assert.ok(U.searchScore('!bad', ['good'], 'fuzzy') > 0);
    });

    it('prefix token', () => {
      assert.ok(U.searchScore('^Xfer', ['Xfer Records'], 'fuzzy') > 0);
      assert.strictEqual(U.searchScore('^Xfer', ['Not Xfer'], 'fuzzy'), 0);
    });

    it('suffix token', () => {
      assert.ok(U.searchScore('wav$', ['file.wav'], 'fuzzy') > 0);
      assert.strictEqual(U.searchScore('wav$', ['wavfile'], 'fuzzy'), 0);
    });
  });

  describe('searchScore (regex mode)', () => {
    it('matches with valid regex', () => {
      assert.ok(U.searchScore('foo|bar', ['bazbar'], 'regex') > 0);
    });

    it('invalid regex falls back to substring', () => {
      assert.ok(U.searchScore('[', ['[literal'], 'regex') > 0);
    });
  });

  describe('searchMatch', () => {
    it('wraps searchScore', () => {
      assert.strictEqual(U.searchMatch('x', ['abc'], 'fuzzy'), false);
      assert.strictEqual(U.searchMatch('a', ['abc'], 'fuzzy'), true);
    });
  });

  describe('fzfMatch', () => {
    it('empty needle yields zero score', () => {
      const m = U.fzfMatch('', 'anything');
      assert.strictEqual(m.score, 0);
      assert.strictEqual(m.indices.length, 0);
    });

    it('returns null when characters missing in order', () => {
      assert.strictEqual(U.fzfMatch('zzz', 'aaa'), null);
    });

    it('finds subsequence in longer string', () => {
      const m = U.fzfMatch('abc', 'axxxbxxxc');
      assert.ok(m.score > 0);
      assert.strictEqual(m.indices.length, 3);
    });
  });

  describe('getMatchIndices', () => {
    it('empty query yields no indices', () => {
      const idx = U.getMatchIndices('', 'text', 'fuzzy');
      assert.strictEqual(idx.length, 0);
    });

    it('collects fuzzy indices', () => {
      const idx = U.getMatchIndices('ab', 'axb', 'fuzzy');
      assert.ok(idx.length >= 2);
    });
  });

  describe('highlightMatch', () => {
    it('escapes HTML in output', () => {
      const h = U.highlightMatch('<bad>', 'bad', 'fuzzy');
      assert.ok(h.includes('&lt;'));
      assert.ok(h.includes('&gt;'));
    });

    it('no marks when no query', () => {
      assert.strictEqual(U.highlightMatch('text', '', 'fuzzy'), U.escapeHtml('text'));
    });
  });

  describe('parseNamePathPrefixes', () => {
    it('extracts simple bare-token prefixes', () => {
      const p = U.parseNamePathPrefixes('name:thuggin tomm', 'fuzzy');
      assert.strictEqual(p.residual, 'tomm');
      assert.deepStrictEqual([...p.nameValues], ['thuggin']);
      assert.deepStrictEqual([...p.pathValues], []);
    });

    it('supports quoted values on both prefix and residual', () => {
      const p = U.parseNamePathPrefixes('path:"testing space" "tommy was here"', 'fuzzy');
      assert.strictEqual(p.residual, 'tommy was here');
      assert.deepStrictEqual([...p.pathValues], ['testing space']);
    });

    it('multiple prefix tokens AND together', () => {
      const p = U.parseNamePathPrefixes('name:foo name:bar path:beats baz', 'fuzzy');
      assert.deepStrictEqual([...p.nameValues], ['foo', 'bar']);
      assert.deepStrictEqual([...p.pathValues], ['beats']);
      assert.strictEqual(p.residual, 'baz');
    });

    it('regex mode bypasses parsing entirely', () => {
      const p = U.parseNamePathPrefixes('name:.*foo', 'regex');
      assert.strictEqual(p.residual, 'name:.*foo');
      assert.deepStrictEqual([...p.nameValues], []);
    });

    it('case-insensitive prefix recognition', () => {
      const p = U.parseNamePathPrefixes('NAME:foo PATH:bar', 'fuzzy');
      assert.deepStrictEqual([...p.nameValues], ['foo']);
      assert.deepStrictEqual([...p.pathValues], ['bar']);
    });
  });

  describe('buildColumnHighlightQuery', () => {
    it('column=name keeps residual + name values, drops path values', () => {
      const q = U.buildColumnHighlightQuery('name:thuggin path:beats kick', 'fuzzy', 'name');
      // Residual "kick" stays; name value "thuggin" is added; "beats" (path) is dropped.
      assert.ok(q.includes('kick'));
      assert.ok(q.includes('thuggin'));
      assert.ok(!q.includes('beats'));
    });

    it('column=path keeps residual + path values, drops name values', () => {
      const q = U.buildColumnHighlightQuery('name:thuggin path:beats kick', 'fuzzy', 'path');
      assert.ok(q.includes('kick'));
      assert.ok(q.includes('beats'));
      assert.ok(!q.includes('thuggin'));
    });

    it('column=other keeps residual only', () => {
      const q = U.buildColumnHighlightQuery('name:thuggin kick', 'fuzzy', 'other');
      assert.strictEqual(q, 'kick');
    });

    it('multi-word prefix value re-quoted as a phrase', () => {
      const q = U.buildColumnHighlightQuery('path:"hip hop" kick', 'fuzzy', 'path');
      assert.ok(q.includes('"hip hop"'));
      assert.ok(q.includes('kick'));
    });

    it('regex mode passes through unchanged', () => {
      const q = U.buildColumnHighlightQuery('name:.*foo', 'regex', 'name');
      assert.strictEqual(q, 'name:.*foo');
    });

    it('no prefix tokens => returns raw query unchanged', () => {
      const q = U.buildColumnHighlightQuery('plain search', 'fuzzy', 'name');
      assert.strictEqual(q, 'plain search');
    });
  });

  describe('highlightMatch with column hint', () => {
    it('column=name highlights only the name value, not stray "name:" chars', () => {
      // Without column hint: would fuzzy-match "n","a","m","e" against text.
      // With column='name': only "kick" (residual) + "" (no name vals) is highlighted —
      // actually here name:kick puts "kick" into name highlight set.
      const html = U.highlightMatch('snare_kick.wav', 'name:kick', 'fuzzy', 'name');
      // No mark on "n","a","m","e" of "snare_..." just because user typed "name:".
      // (snare contains 'n','a','e' so a stray-fuzzy-match would mark them.)
      // Safer assertion: only "kick" is wrapped in <mark>.
      const markCount = (html.match(/<mark/g) || []).length;
      assert.strictEqual(markCount, 1, 'only one mark span for kick, not stray prefix chars');
      assert.ok(html.includes('<mark class="fzf-hl">kick</mark>'));
    });

    it('column=other (e.g. format col) ignores name:/path: tokens entirely', () => {
      const html = U.highlightMatch('WAV', 'name:kick wav', 'fuzzy', 'other');
      // Only "wav" residual highlights against "WAV".
      assert.ok(html.toLowerCase().includes('<mark class="fzf-hl">wav</mark>'));
    });
  });

  describe('formatTime', () => {
    it('zero and non-finite', () => {
      assert.strictEqual(U.formatTime(0), '0:00');
      assert.strictEqual(U.formatTime(NaN), '0:00');
    });

    it('minutes and padded seconds', () => {
      assert.strictEqual(U.formatTime(125), '2:05');
      assert.strictEqual(U.formatTime(59), '0:59');
    });
  });

  describe('formatAudioSize', () => {
    it('zero', () => {
      assert.strictEqual(U.formatAudioSize(0), '0 B');
    });

    it('kilobytes', () => {
      assert.match(U.formatAudioSize(1536), /^1\.5 KB$/);
    });
  });

  describe('escapePath', () => {
    it('escapes backslash and single quote', () => {
      assert.strictEqual(U.escapePath("a\\b'c"), "a\\\\b\\'c");
    });
  });

  describe('slugify (utils.js)', () => {
    it('camelCase and digit boundaries', () => {
      assert.strictEqual(U.slugify('MadronaLabs'), 'madrona-labs');
      assert.strictEqual(U.slugify('Plugin3'), 'plugin-3');
      assert.strictEqual(U.slugify('3Plugin'), '3-plugin');
    });

    it('strips non-alphanumeric runs', () => {
      assert.strictEqual(U.slugify('  Foo__Bar!!  '), 'foo-bar');
    });
  });

  describe('findByPath', () => {
    it('returns item by path', () => {
      const arr = [{ path: '/a/1', v: 1 }, { path: '/b/2', v: 2 }];
      assert.strictEqual(U.findByPath(arr, '/b/2').v, 2);
    });

    it('indexes appended rows without full rescan', () => {
      const arr = [{ path: '/first', n: 1 }];
      assert.strictEqual(U.findByPath(arr, '/first').n, 1);
      arr.push({ path: '/second', n: 2 });
      assert.strictEqual(U.findByPath(arr, '/second').n, 2);
    });

    it('reindex rebuilds after forced', () => {
      const arr = [{ path: '/x', id: 1 }];
      U.findByPath(arr, '/x');
      arr.length = 0;
      arr.push({ path: '/y', id: 2 });
      assert.strictEqual(U.findByPath(arr, '/y', true).id, 2);
    });

    it('undefined for missing path or empty args', () => {
      assert.strictEqual(U.findByPath([{ path: '/a' }], '/nope'), undefined);
      assert.strictEqual(U.findByPath(null, '/a'), undefined);
      assert.strictEqual(U.findByPath([], ''), undefined);
    });
  });

  describe('charClass / positionBonus', () => {
    it('charClass buckets', () => {
      assert.strictEqual(U.charClass('a'), 1);
      assert.strictEqual(U.charClass('Z'), 2);
      assert.strictEqual(U.charClass('5'), 3);
      assert.strictEqual(U.charClass(' '), 0);
    });

    it('positionBonus boundary and camel', () => {
      assert.ok(U.positionBonus(' ', 'x') > 0);
      assert.ok(U.positionBonus('a', 'B') > 0);
    });
  });
});
