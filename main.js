const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Worker } = require('worker_threads');
const history = require('./history');

let mainWindow;
let scanWorker = null;
let updateWorker = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#05050a',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC handlers
ipcMain.handle('scan-plugins', async () => {
  return new Promise((resolve, reject) => {
    const allPlugins = [];
    let directories = [];

    scanWorker = new Worker(path.join(__dirname, 'scanner-worker.js'));

    scanWorker.on('message', (msg) => {
      if (msg.type === 'total') {
        directories = msg.directories;
        mainWindow.webContents.send('scan-progress', {
          phase: 'start',
          total: msg.total,
          processed: 0,
        });
      } else if (msg.type === 'batch') {
        allPlugins.push(...msg.plugins);
        mainWindow.webContents.send('scan-progress', {
          phase: 'scanning',
          plugins: msg.plugins,
          processed: msg.processed,
          total: msg.total,
        });
      } else if (msg.type === 'done') {
        scanWorker = null;
        allPlugins.sort((a, b) => a.name.localeCompare(b.name));
        const snapshot = history.saveScan(allPlugins, directories);
        resolve({ plugins: allPlugins, directories, snapshotId: snapshot.id });
      }
    });

    scanWorker.on('error', (err) => { scanWorker = null; reject(err); });
    scanWorker.on('exit', (code) => {
      scanWorker = null;
      if (code !== 0) reject(new Error(`stopped`));
    });
  });
});

ipcMain.handle('stop-scan', async () => {
  if (scanWorker) {
    await scanWorker.terminate();
    scanWorker = null;
  }
});

// History IPC handlers
ipcMain.handle('history-get-scans', async () => {
  return history.getScans();
});

ipcMain.handle('history-get-detail', async (_event, id) => {
  return history.getScanDetail(id);
});

ipcMain.handle('history-delete', async (_event, id) => {
  history.deleteScan(id);
});

ipcMain.handle('history-clear', async () => {
  history.clearHistory();
});

ipcMain.handle('history-diff', async (_event, oldId, newId) => {
  return history.diffScans(oldId, newId);
});

ipcMain.handle('history-latest', async () => {
  return history.getLatestScan();
});

ipcMain.handle('kvr-cache-get', async () => {
  return history.getKvrCache();
});

ipcMain.handle('kvr-cache-update', async (_event, entries) => {
  history.updateKvrCache(entries);
});

ipcMain.handle('check-updates', async (_event, plugins) => {
  return new Promise((resolve, reject) => {
    updateWorker = new Worker(path.join(__dirname, 'update-worker.js'), {
      workerData: { plugins },
    });

    updateWorker.on('message', (msg) => {
      if (msg.type === 'start') {
        mainWindow.webContents.send('update-progress', {
          phase: 'start',
          total: msg.total,
          processed: 0,
        });
      } else if (msg.type === 'batch') {
        mainWindow.webContents.send('update-progress', {
          phase: 'checking',
          plugins: msg.plugins,
          processed: msg.processed,
          total: msg.total,
        });
      } else if (msg.type === 'done') {
        updateWorker = null;
        resolve(msg.plugins);
      } else if (msg.type === 'error') {
        updateWorker = null;
        reject(new Error(msg.message));
      }
    });

    updateWorker.on('error', (err) => { updateWorker = null; reject(err); });
    updateWorker.on('exit', (code) => {
      updateWorker = null;
      if (code !== 0) reject(new Error(`stopped`));
    });
  });
});

ipcMain.handle('stop-updates', async () => {
  if (updateWorker) {
    await updateWorker.terminate();
    updateWorker = null;
  }
});

ipcMain.handle('resolve-kvr', async (_event, directUrl, pluginName) => {
  const https = require('https');

  // Bogus landing pages KVR redirects to when a product doesn't exist
  const KVR_INVALID_PAGES = [
    '/plugins/the-newest-plugins',
    '/plugins/newest',
    '/plugins',
  ];

  function fetchWithFinalUrl(url, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
      https.get(url, { timeout: 8000, headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      }}, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
          let redirectUrl = res.headers.location;
          if (redirectUrl.startsWith('/')) redirectUrl = 'https://www.kvraudio.com' + redirectUrl;

          // Check if redirect target is a known invalid page
          const redirectPath = redirectUrl.replace(/https?:\/\/[^/]+/, '').replace(/[?#].*/, '');
          if (KVR_INVALID_PAGES.some(p => redirectPath.startsWith(p))) {
            res.resume();
            return resolve({ html: '', finalUrl: redirectUrl, valid: false });
          }

          res.resume();
          return fetchWithFinalUrl(redirectUrl, maxRedirects - 1).then(resolve, reject);
        }
        let body = '';
        res.on('data', (c) => body += c);
        res.on('end', () => {
          // Also check final URL in case of JS/meta redirects embedded in HTML
          const finalPath = url.replace(/https?:\/\/[^/]+/, '').replace(/[?#].*/, '');
          const isInvalid = KVR_INVALID_PAGES.some(p => finalPath.startsWith(p));
          resolve({ html: body, finalUrl: url, valid: !isInvalid && res.statusCode < 400 });
        });
        res.on('error', reject);
      }).on('error', reject).on('timeout', function() { this.destroy(); reject(new Error('timeout')); });
    });
  }

  function fetchHtml(url) {
    return fetchWithFinalUrl(url).then(r => r.html);
  }

  const platformKeywords = {
    darwin: ['mac', 'macos', 'osx', 'os x', 'apple'],
    win32: ['win', 'windows', 'pc'],
    linux: ['linux', 'ubuntu', 'debian'],
  }[process.platform] || [];

  function extractDownloadUrl(html) {
    // Find download/get links
    const linkPattern = /href="(https?:\/\/[^"]*(?:download|get|buy|release)[^"]*)"/gi;
    const allLinks = [];
    let m;
    while ((m = linkPattern.exec(html)) !== null) {
      allLinks.push(m[1]);
    }

    // Prefer platform-specific link
    for (const link of allLinks) {
      const lower = link.toLowerCase();
      if (platformKeywords.some(kw => lower.includes(kw))) {
        return link;
      }
    }

    // Check for platform text near download links
    for (const kw of platformKeywords) {
      const ctxPattern = new RegExp(
        `(?:${kw})[^<]{0,80}?href="(https?:\\/\\/[^"]*(?:download|get)[^"]*)"` +
        `|href="(https?:\\/\\/[^"]*(?:download|get)[^"]*)"[^<]{0,80}?(?:${kw})`, 'gi'
      );
      const ctxMatch = ctxPattern.exec(html);
      if (ctxMatch) return ctxMatch[1] || ctxMatch[2];
    }

    // Any download link
    return allLinks.length > 0 ? allLinks[0] : null;
  }

  async function scrapeProductPage(productUrl) {
    try {
      const html = await fetchHtml(productUrl);
      const downloadUrl = extractDownloadUrl(html);
      return { productUrl, downloadUrl };
    } catch {
      return { productUrl, downloadUrl: null };
    }
  }

  // Try direct URL first -- follow redirects and check we didn't land on a generic page
  try {
    const response = await fetchWithFinalUrl(directUrl);
    if (response.valid) {
      const downloadUrl = extractDownloadUrl(response.html);
      return { productUrl: response.finalUrl, downloadUrl };
    }
  } catch {}

  // Fallback: search KVR
  try {
    const searchUrl = `https://www.kvraudio.com/plugins/search?q=${encodeURIComponent(pluginName)}`;
    const html = await fetchHtml(searchUrl);

    const pattern = /href="(\/product\/[^"]+)"/gi;
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const foundUrl = 'https://www.kvraudio.com' + match[1];
      const result = await scrapeProductPage(foundUrl);
      return result;
    }
  } catch {}

  // Last resort
  return {
    productUrl: `https://www.kvraudio.com/plugins/search?q=${encodeURIComponent(pluginName)}`,
    downloadUrl: null,
  };
});

ipcMain.handle('open-update-url', async (_event, url) => {
  const { shell } = require('electron');
  shell.openExternal(url);
});

ipcMain.handle('open-plugin-folder', async (_event, pluginPath) => {
  const { shell } = require('electron');
  shell.showItemInFolder(pluginPath);
});
