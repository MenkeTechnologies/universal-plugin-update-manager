const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── Mirrors src-tauri/src/lib.rs dsv_escape ──
function dsvEscape(s, sep) {
  if (s.includes(sep) || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function detectSeparator(filePath) {
  return filePath.endsWith('.tsv') ? '\t' : ',';
}

describe('dsvEscape', () => {
  it('plain string unchanged for comma sep', () => {
    assert.strictEqual(dsvEscape('hello', ','), 'hello');
  });

  it('wraps when field contains separator', () => {
    assert.strictEqual(dsvEscape('a,b', ','), '"a,b"');
    assert.strictEqual(dsvEscape('a\tb', '\t'), '"a\tb"');
  });

  it('escapes quotes', () => {
    assert.strictEqual(dsvEscape('say "hi"', ','), '"say ""hi"""');
  });

  it('wraps on newline', () => {
    assert.strictEqual(dsvEscape('a\nb', ','), '"a\nb"');
  });

  it('empty string', () => {
    assert.strictEqual(dsvEscape('', ','), '');
  });
});

describe('detectSeparator', () => {
  it('tsv file uses tab', () => {
    assert.strictEqual(detectSeparator('/out.tsv'), '\t');
  });

  it('csv uses comma', () => {
    assert.strictEqual(detectSeparator('/out.csv'), ',');
  });
});
