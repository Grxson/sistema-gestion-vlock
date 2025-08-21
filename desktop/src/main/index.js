const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');

let mainWindow;
const appVersion = app.getVersion() || '1.0.0';

console.log('Electron main process starting...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('__dirname:', __dirname);

function createWindow() {
  console.log('Creating window...');
  mainWindow = new BrowserWindow({
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
    console.log('Loading development URL: http://localhost:3001');
    mainWindow.loadURL('http://localhost:3001');
    mainWindow.webContents.openDevTools();
  } else {
    const buildPath = path.join(__dirname, '../build/index.html');
    console.log('Loading production file:', buildPath);
    mainWindow.loadFile(buildPath);
  }

  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Content loaded successfully');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// Manejador para obtener información del sistema
ipcMain.handle('get-system-info', async () => {
  return {
    os: `${os.type()} ${os.release()}`,
    platform: process.platform,
    node: process.versions.node,
    electron: process.versions.electron,
    app: 'VLock Sistema de Gestión',
    version: appVersion
  };
});

// Manejador para reiniciar la aplicación
ipcMain.handle('restart-app', async () => {
  app.relaunch();
  app.exit(0);
});

// Manejador para abrir los archivos de registro
ipcMain.handle('open-logs', async () => {
  const logPath = path.join(app.getPath('userData'), 'logs');
  
  // Crear directorio de logs si no existe
  if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath, { recursive: true });
    fs.writeFileSync(path.join(logPath, 'app.log'), 'Log file initialized\n');
  }
  
  shell.openPath(logPath);
});
