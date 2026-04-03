const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Same as frontend/js/xref.js normalizePluginName / ui.test.js ──
function normalizePluginName(name) {
  let s = name.trim();
  const bracketRe = /\s*[\(\[](x64|x86_64|x86|arm64|aarch64|64-?bit|32-?bit|intel|apple silicon|universal|stereo|mono|vst3?|au|aax)[\)\]]$/i;
  let prev;
  do {
    prev = s;
    s = s.replace(bracketRe, '');
  } while (s !== prev);
  s = s.replace(/\s+(x64|x86_64|x86|64bit|32bit)$/i, '');
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

describe('normalizePluginName (extended)', () => {
  it('strips (VST3) suffix', () => {
    assert.strictEqual(normalizePluginName('Diva (VST3)'), 'diva');
  });

  it('strips (AU) suffix', () => {
    assert.strictEqual(normalizePluginName('Synth (AU)'), 'synth');
  });

  it('strips (AAX) suffix', () => {
    assert.strictEqual(normalizePluginName('Pro-Q 3 (AAX)'), 'pro-q 3');
  });

  it('strips apple silicon variant', () => {
    assert.strictEqual(normalizePluginName('Plugin (Apple Silicon)'), 'plugin');
  });

  it('strips universal binary label', () => {
    assert.strictEqual(normalizePluginName('Tool (Universal)'), 'tool');
  });

  it('strips mono/stereo bracket', () => {
    assert.strictEqual(normalizePluginName('Track (Mono)'), 'track');
    assert.strictEqual(normalizePluginName('Track (Stereo)'), 'track');
  });

  it('32-bit and 64-bit bare suffixes', () => {
    assert.strictEqual(normalizePluginName('OldPlugin 32bit'), 'oldplugin');
    assert.strictEqual(normalizePluginName('OldPlugin 64bit'), 'oldplugin');
  });

  it('preserves version numbers in name', () => {
    assert.strictEqual(normalizePluginName('Plugin 2.0'), 'plugin 2.0');
  });

  it('handles nested brackets iteratively', () => {
    assert.strictEqual(normalizePluginName('X (VST3) (x64)'), 'x');
  });

  it('empty after strip becomes empty string', () => {
    assert.strictEqual(normalizePluginName('(x64)'), '');
  });

  it('only whitespace becomes empty', () => {
    assert.strictEqual(normalizePluginName('   '), '');
  });

  it('unicode plugin names lowercased', () => {
    assert.strictEqual(normalizePluginName('ÜberSynth'), 'übersynth');
  });

  it('hyphenated names', () => {
    assert.strictEqual(normalizePluginName('Pro-Q 4'), 'pro-q 4');
  });

  it('multiple spaces collapsed', () => {
    assert.strictEqual(normalizePluginName('A    B     C'), 'a b c');
  });

  it('bracket with intel', () => {
    assert.strictEqual(normalizePluginName('FX (Intel)'), 'fx');
  });
});

describe('normalizePluginName dedup simulation', () => {
  it('same normalized key for arch variants', () => {
    const base = 'Serum';
    const variants = ['Serum', 'Serum (x64)', 'SERUM (X64)', 'serum x64'];
    const keys = new Set(variants.map(normalizePluginName));
    assert.strictEqual(keys.size, 1);
    assert.strictEqual([...keys][0], normalizePluginName(base));
  });
});
