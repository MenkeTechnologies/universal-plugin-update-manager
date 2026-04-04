const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── From frontend/js/export.js ──
function exportFileName(label) {
  const now = new Date();
  const ts = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
  return `audiohaxor-${label}-${ts}`;
}

const EXPORT_FORMAT_DEFS = [
  { id: 'json', labelKey: 'ui.export.fmt_json', ext: 'json', icon: '{ }', descKey: 'ui.export.fmt_json_desc' },
  { id: 'toml', labelKey: 'ui.export.fmt_toml', ext: 'toml', icon: '[T]', descKey: 'ui.export.fmt_toml_desc' },
  { id: 'csv', labelKey: 'ui.export.fmt_csv', ext: 'csv', icon: ',,,', descKey: 'ui.export.fmt_csv_desc' },
  { id: 'tsv', labelKey: 'ui.export.fmt_tsv', ext: 'tsv', icon: '\\t', descKey: 'ui.export.fmt_tsv_desc' },
  { id: 'pdf', labelKey: 'ui.export.fmt_pdf', ext: 'pdf', icon: '&#128196;', descKey: 'ui.export.fmt_pdf_desc' },
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

describe('EXPORT_FORMAT_DEFS', () => {
  it('has unique ids', () => {
    const ids = EXPORT_FORMAT_DEFS.map(f => f.id);
    assert.strictEqual(new Set(ids).size, ids.length);
  });

  it('each format has id, labelKey, ext', () => {
    for (const f of EXPORT_FORMAT_DEFS) {
      assert.ok(f.id && f.labelKey && f.ext);
      assert.strictEqual(f.id, f.ext);
    }
  });

  it('includes json as default-friendly first entry', () => {
    assert.strictEqual(EXPORT_FORMAT_DEFS[0].id, 'json');
  });

  it('pdf uses pdf extension', () => {
    assert.strictEqual(EXPORT_FORMAT_DEFS.find(f => f.id === 'pdf').ext, 'pdf');
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
