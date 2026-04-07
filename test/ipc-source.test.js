/**
 * Loads ipc.js with Tauri stubs — verifies reloadAppStrings maps locales to backend
 * and forwards null for unsupported codes (seeded locales pass through).
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadIpcSandbox(invokeImpl) {
  const calls = [];
  const sandbox = {
    console,
    document: {
      getElementById: () => null,
      addEventListener: () => {},
    },
    addEventListener: () => {},
    window: {},
    __TAURI__: {
      core: {
        invoke: async (cmd, args) => {
          calls.push({ cmd, args: args ? { ...args } : args });
          return invokeImpl(cmd, args);
        },
        convertFileSrc: (s) => s,
      },
      event: {
        listen: () => () => {},
      },
    },
  };
  sandbox.window = sandbox;
  sandbox.vstUpdater = { appendLog: () => {} };
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '..', 'frontend', 'js', 'ipc.js'), 'utf8'),
    sandbox
  );
  return { sandbox, calls };
}

describe('frontend/js/ipc.js (vm-loaded)', () => {
  const { sandbox: ipcSandbox } = loadIpcSandbox(async () => ({}));
  const locales = ipcSandbox.SUPPORTED_UI_LOCALES;

  it('exposes SUPPORTED_UI_LOCALES matching normalizeUiLocale', () => {
    assert.ok(Array.isArray(locales));
    assert.ok(locales.includes('en'));
    for (const loc of locales) {
      assert.strictEqual(ipcSandbox.normalizeUiLocale(loc), loc);
    }
  });

  for (const loc of locales) {
    it(`reloadAppStrings passes ${loc} to get_app_strings`, async () => {
      const { sandbox, calls } = loadIpcSandbox(async () => ({}));
      await sandbox.reloadAppStrings(loc);
      const getStr = calls.filter((c) => c.cmd === 'get_app_strings');
      assert.strictEqual(getStr[getStr.length - 1].args.locale, loc);
    });
  }

  it('reloadAppStrings sends null for arbitrary garbage locale', async () => {
    const { sandbox, calls } = loadIpcSandbox(async () => ({}));
    await sandbox.reloadAppStrings('xx-YY');
    const getStr = calls.filter((c) => c.cmd === 'get_app_strings');
    assert.strictEqual(getStr[getStr.length - 1].args.locale, null);
  });

  it('reloadAppStrings passes null for undefined locale', async () => {
    const { sandbox, calls } = loadIpcSandbox(async () => ({}));
    await sandbox.reloadAppStrings(undefined);
    const getStr = calls.filter((c) => c.cmd === 'get_app_strings');
    assert.strictEqual(getStr[getStr.length - 1].args.locale, null);
  });

  it('reloadAppStrings passes null for empty string locale', async () => {
    const { sandbox, calls } = loadIpcSandbox(async () => ({}));
    await sandbox.reloadAppStrings('');
    const getStr = calls.filter((c) => c.cmd === 'get_app_strings');
    assert.strictEqual(getStr[getStr.length - 1].args.locale, null);
  });
});
