const { app, BrowserWindow, ipcMain, shell, dialog, screen } = require('electron');
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

  // Obtener las dimensiones del área de trabajo de la pantalla principal
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Calcular el tamaño al 80% del área de trabajo
  const windowWidth = Math.floor(width * 0.8);
  const windowHeight = Math.floor(height * 0.8);

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    show: false, // No mostrar hasta que esté listo
    icon: path.resolve(__dirname, '../build/favicon-32x32.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, '../preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    autoHideMenuBar: true,
    titleBarStyle: 'default'
  });

  console.log('Window created, loading content...');
  const buildPath = getBuildPath();
  if (buildPath) {
    console.log('🚀 Cargando archivo:', buildPath);
    mainWindow.loadFile(buildPath);
  } else {
    console.error('❌ No se pudo cargar ningún archivo index.html.');
    dialog.showErrorBox('Error', 'No se pudo encontrar el archivo index.html para cargar la aplicación.');
    app.quit();
    return;
  }

  // Eventos de la ventana
  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Content loaded successfully');
    mainWindow.show(); // Mostrar cuando esté listo
    mainWindow.focus();
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM ready');
    if (!mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Función para obtener la ruta del archivo `index.html`
function getBuildPath() {
  const possiblePaths = [
    path.join(process.resourcesPath, 'app', 'index.html'), // Extra resources (empaquetado)
    path.resolve(__dirname, '../build/index.html'), // Build local
    path.resolve(__dirname, '../../build/index.html'), // Build relativo
    path.resolve(__dirname, '../../../../build/index.html') // Dev build
  ];

  console.log('Buscando archivos en las siguientes ubicaciones:');
  for (const filePath of possiblePaths) {
    console.log(`- ${filePath} - Existe:`, fs.existsSync(filePath));
    if (fs.existsSync(filePath)) {
      console.log(`✓ Cargando archivo desde: ${filePath}`);
      return filePath;
    }
  }

  console.error('❌ No se encontró index.html en las ubicaciones conocidas.');
  return null;
}

// Eventos de `app`
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
    app: 'Vlock Sistema de Gestión',
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

  try {
    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath, { recursive: true });
      fs.writeFileSync(path.join(logPath, 'app.log'), 'Log file initialized\n');
    }

    shell.openPath(logPath);
  } catch (err) {
    console.error('Error al abrir los logs:', err);
    dialog.showErrorBox('Error', 'No se pudo abrir el directorio de logs.');
  }
});

// Manejador para guardar archivo Excel
ipcMain.handle('save-excel-file', async (event, { buffer, defaultFileName }) => {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'Guardar archivo Excel',
      defaultPath: path.join(app.getPath('downloads'), defaultFileName),
      filters: [
        { name: 'Excel Files', extensions: ['xlsx'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    // Convertir el array de buffer a Buffer de Node.js
    const nodeBuffer = Buffer.from(buffer);
    fs.writeFileSync(filePath, nodeBuffer);

    return { success: true, filePath };
  } catch (error) {
    console.error('Error al guardar archivo Excel:', error);
    return { success: false, error: error.message };
  }
});

// Manejador para guardar archivo PDF
ipcMain.handle('save-pdf-file', async (event, { buffer, defaultFileName }) => {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'Guardar archivo PDF',
      defaultPath: path.join(app.getPath('downloads'), defaultFileName),
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    // Convertir el array de buffer a Buffer de Node.js
    const nodeBuffer = Buffer.from(buffer);
    fs.writeFileSync(filePath, nodeBuffer);

    return { success: true, filePath };
  } catch (error) {
    console.error('Error al guardar archivo PDF:', error);
    return { success: false, error: error.message };
  }
}); 