const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveTemplate: (template) => ipcRenderer.invoke('save-template', template),
  loadTemplate: () => ipcRenderer.invoke('load-template'),
  printCheck: () => ipcRenderer.invoke('print-check'),
  
  onMenuNewCheck: (callback) => ipcRenderer.on('menu-new-check', callback),
  onTemplateUpload: (callback) => ipcRenderer.on('template-upload', callback),
  onThemeChange: (callback) => ipcRenderer.on('theme-change', callback),
  
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});