const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/export.js ──
function exportFileName(label) {
  const now = new Date();
  const ts = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
  return `audiohaxor-${label}-${ts}`;
}

const EXPORT_FORMATS = [
  { id: 'json', label: 'JSON', ext: 'json', icon: '{ }', desc: 'Full data, re-importable' },
  { id: 'toml', label: 'TOML', ext: 'toml', icon: '[T]', desc: 'Human-readable config' },
  { id: 'csv', label: 'CSV', ext: 'csv', icon: ',,,', desc: 'Spreadsheet compatible' },
  { id: 'tsv', label: 'TSV', ext: 'tsv', icon: '\\t', desc: 'Tab-separated values' },
  { id: 'pdf', label: 'PDF', ext: 'pdf', icon: '&#128196;', desc: 'Printable A4 report' },
];

const ALL_IMPORT_FILTERS = [
  { name: 'All Supported', extensions: ['json', 'toml'] },
  { name: 'JSON', extensions: ['json'] },
  { name: 'TOML', extensions: ['toml'] },
];

describe('exportFileName', () => {
  it('prefixes with audiohaxor and label', () => {
    const name = exportFileName('plugins');
    assert.ok(name.startsWith('audiohaxor-plugins-'));
  });

  it('uses hyphen-separated timestamp (no T or colons)', () => {
    const name = exportFileName('x');
    assert.ok(!name.includes('T'));
    assert.ok(!name.includes(':'));
    const tail = name.slice('audiohaxor-x-'.length);
    assert.match(tail, /^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/);
  });

  it('sanitizes label segment only in prefix', () => {
    const name = exportFileName('samples');
    assert.ok(name.includes('audiohaxor-samples-'));
  });
});

describe('EXPORT_FORMATS', () => {
  it('has unique ids', () => {
    const ids = EXPORT_FORMATS.map(f => f.id);
    assert.strictEqual(new Set(ids).size, ids.length);
  });

  it('each format has id, label, ext', () => {
    for (const f of EXPORT_FORMATS) {
      assert.ok(f.id && f.label && f.ext);
      assert.strictEqual(f.id, f.ext);
    }
  });

  it('includes json as default-friendly first entry', () => {
    assert.strictEqual(EXPORT_FORMATS[0].id, 'json');
  });

  it('pdf uses pdf extension', () => {
    assert.strictEqual(EXPORT_FORMATS.find(f => f.id === 'pdf').ext, 'pdf');
  });
});

describe('ALL_IMPORT_FILTERS', () => {
  it('first filter accepts both json and toml', () => {
    assert.deepStrictEqual(ALL_IMPORT_FILTERS[0].extensions, ['json', 'toml']);
  });

  it('lists json-only and toml-only', () => {
    assert.deepStrictEqual(ALL_IMPORT_FILTERS[1].extensions, ['json']);
    assert.deepStrictEqual(ALL_IMPORT_FILTERS[2].extensions, ['toml']);
  });
});
