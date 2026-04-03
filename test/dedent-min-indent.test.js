const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function minIndentLines(lines) {
  const nonempty = lines.filter(l => l.trim());
  if (nonempty.length === 0) return lines;
  let m = Infinity;
  for (const l of nonempty) {
    const indent = l.match(/^\s*/)[0].length;
    m = Math.min(m, indent);
  }
  return lines.map(l => (l.trim() ? l.slice(m) : l));
}

describe('minIndentLines', () => {
  it('strips common', () => {
    const out = minIndentLines(['    a', '    b', '']);
    assert.deepStrictEqual(out, ['a', 'b', '']);
  });
});
