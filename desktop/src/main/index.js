const { app, BrowserWindow } = require('electron');
const path = require('path');

console.log('Electron main process starting...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('__dirname:', __dirname);

function createWindow() {
  console.log('Creating window...');
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js')
    }
  });

  console.log('Window created, loading content...');
  if (process.env.NODE_ENV === 'development') {
    console.log('Loading development URL: http://localhost:3000');
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    const buildPath = path.join(__dirname, '../build/index.html');
    console.log('Loading production file:', buildPath);
    win.loadFile(buildPath);
  }

  win.on('closed', () => {
    win.on = null;
    console.log('Window closed');
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  win.webContents.on('did-finish-load', () => {
    console.log('Content loaded successfully');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});