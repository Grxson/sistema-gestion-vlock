// Preload mantiene un puente seguro entre el proceso principal y el renderer
const { contextBridge, ipcRenderer } = require('electron');

// Expone APIs seguras al proceso de renderizado
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    // Exponer funciones del IPC Renderer con una interfaz sencilla
    invoke: (channel, ...args) => {
      // Lista blanca de canales permitidos
      const validChannels = [
        'get-system-info',
        'restart-app',
        'open-logs',
        'save-excel-file',
        'save-pdf-file'
      ];
      
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      
      return Promise.reject(new Error(`Canal no permitido: ${channel}`));
    }
  }
});