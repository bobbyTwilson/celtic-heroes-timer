const { app, BrowserWindow } = require('electron');
const path = require('path');
const log = require('electron-log').default;
const { autoUpdater } = require('electron-updater');

Object.assign(console, log.functions); // route console.* to electron-log

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1300,
    height: 900,
    icon: path.join(__dirname, 'icon.png'), // optional
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });
  win.loadFile('boss-timers.html');
}

function setupAutoUpdate() {
  if (!app.isPackaged) {
    console.log('Skipping auto-update in dev mode');
    return;
  }

  autoUpdater.autoDownload = true;       // download updates automatically
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => console.log('Checking for update...'));
  autoUpdater.on('update-available', info => console.log('Update available:', info.version));
  autoUpdater.on('update-not-available', () => console.log('No update available'));
  autoUpdater.on('error', err => console.error('Auto-updater error:', err));
  autoUpdater.on('download-progress', p => console.log(`Downloading: ${Math.round(p.percent)}%`));
  autoUpdater.on('update-downloaded', () => console.log('Update ready, will install on quit.'));

  // Check once on startup, then daily
  autoUpdater.checkForUpdatesAndNotify();
  setInterval(() => autoUpdater.checkForUpdates(), 24 * 60 * 60 * 1000);
}

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdate();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
