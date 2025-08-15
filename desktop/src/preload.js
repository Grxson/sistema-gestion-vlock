// Preload mantiene un puente seguro entre el proceso principal y el renderer
const { contextBridge } = require('electron');

// Expone APIs seguras al proceso de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
  // Puedes añadir APIs personalizadas aquí
  doThing: () => {}
});