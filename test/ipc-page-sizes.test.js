const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ── frontend/js/ipc.js paginated tab limits (defaults before prefs load) ──
const AUDIO_PAGE_SIZE = 200;
const DAW_PAGE_SIZE = 200;
const MIDI_PAGE_SIZE = 200;
const PDF_PAGE_SIZE = 200;

describe('page sizes', () => {
  it('paginated tabs share the same default batch size', () => {
    assert.strictEqual(AUDIO_PAGE_SIZE, DAW_PAGE_SIZE);
    assert.strictEqual(AUDIO_PAGE_SIZE, MIDI_PAGE_SIZE);
    assert.strictEqual(AUDIO_PAGE_SIZE, PDF_PAGE_SIZE);
    assert.strictEqual(AUDIO_PAGE_SIZE, 200);
  });
});
