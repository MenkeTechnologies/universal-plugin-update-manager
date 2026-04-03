const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Minimal CSV field split respecting quoted commas
function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
    } else if (c === ',' && !inQ) {
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

describe('splitCsvLine', () => {
  it('simple', () => {
    assert.deepStrictEqual(splitCsvLine('a,b,c'), ['a', 'b', 'c']);
  });

  it('quoted comma', () => {
    assert.deepStrictEqual(splitCsvLine('"a,b",c'), ['a,b', 'c']);
  });

  it('empty fields', () => {
    assert.deepStrictEqual(splitCsvLine(',,'), ['', '', '']);
  });
});
