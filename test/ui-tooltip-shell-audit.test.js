/**
 * Static audit: primary chrome in `frontend/index.html` should expose a hover tooltip
 * (`title`, `data-i18n-title`, or `aria-label`) on interactive controls so `tooltip-hover.js`
 * can show delayed help. (data-i18n-title is resolved to title at runtime by i18n-ui.js.)
 *
 * Context menus: `context-menu.js` attaches a capture-phase handler and ends with a shell
 * fallback (`buildFallbackShellContextMenu`) for `.app` / dock chrome so right-click always
 * yields a menu when default is suppressed.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const TOOLTIP_ATTR = /(?:\btitle\s*=|\bdata-i18n-title\s*=|\baria-label\s*=)/i;

function nextTagClose(html, from) {
  let i = from;
  let inQuote = null;
  while (i < html.length) {
    const c = html[i];
    if (inQuote) {
      if (c === inQuote && html[i - 1] !== '\\') inQuote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      inQuote = c;
      i++;
      continue;
    }
    if (c === '>') return i;
    i++;
  }
  return -1;
}

function collectOpenTags(html, localName) {
  const needle = `<${localName}`;
  const out = [];
  let pos = 0;
  while (pos < html.length) {
    const start = html.indexOf(needle, pos);
    if (start === -1) break;
    const after = start + needle.length;
    const boundary = html[after] || '';
    if (boundary !== ' ' && boundary !== '>' && boundary !== '\t' && boundary !== '\n' && boundary !== '\r') {
      pos = after;
      continue;
    }
    const end = nextTagClose(html, after);
    if (end === -1) break;
    out.push({ start, attrs: html.slice(start + needle.length, end) });
    pos = end + 1;
  }
  return out;
}

function auditTags(html, tagName, filterAttrs) {
  const missing = [];
  for (const { attrs } of collectOpenTags(html, tagName)) {
    if (filterAttrs && !filterAttrs(attrs)) continue;
    if (!TOOLTIP_ATTR.test(attrs)) missing.push(attrs.trim().replace(/\s+/g, ' ').slice(0, 140));
  }
  return missing;
}

test('index.html: buttons and primary inputs have tooltip-capable attributes', () => {
  const html = readFileSync(join(root, 'frontend', 'index.html'), 'utf8');
  const badButtons = auditTags(html, 'button', (a) => !/\bstyle\s*=\s*["'][^"']*display\s*:\s*none/i.test(a));
  assert.deepEqual(badButtons, [], `buttons missing title/data-i18n-title/aria-label:\n${badButtons.join('\n')}`);

  const badInput = auditTags(html, 'input', (a) => {
    if (/\btype\s*=\s*["']hidden["']/i.test(a)) return false;
    if (/\bstyle\s*=\s*["'][^"']*display\s*:\s*none/i.test(a)) return false;
    return true;
  });
  assert.deepEqual(badInput, [], `inputs missing tooltip attrs:\n${badInput.join('\n')}`);

  const badSelect = auditTags(html, 'select');
  assert.deepEqual(badSelect, [], `selects missing tooltip attrs:\n${badSelect.join('\n')}`);

  const badTa = auditTags(html, 'textarea');
  assert.deepEqual(badTa, [], `textareas missing tooltip attrs:\n${badTa.join('\n')}`);

  const badSum = auditTags(html, 'summary');
  assert.deepEqual(badSum, [], `summary elements missing tooltip attrs:\n${badSum.join('\n')}`);
});

test('context-menu.js: shell fallback keeps chrome right-click usable', () => {
  const src = readFileSync(join(root, 'frontend', 'js', 'context-menu.js'), 'utf8');
  assert.match(src, /function\s+buildFallbackShellContextMenu\s*\(/, 'expected buildFallbackShellContextMenu');
  assert.match(
    src,
    /showContextMenu\s*\(\s*e\s*,\s*buildFallbackShellContextMenu\s*\(\s*e\s*\)\s*\)/,
    'expected universal shell menu invocation'
  );
});
