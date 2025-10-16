const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const packageJson = require('./package.json');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    const buildPath = path.join(__dirname, 'build', 'index.html');
    console.log('Loading build from:', buildPath);
    mainWindow.loadFile(buildPath);
    mainWindow.webContents.openDevTools(); // Keep devtools open to see errors
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Check',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu-new-check')
        },
        {
          label: 'Upload Template',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [{ name: 'JSON Files', extensions: ['json'] }]
            });
            
            if (!result.canceled) {
              const filePath = result.filePaths[0];
              try {
                const content = fs.readFileSync(filePath, 'utf8');
                mainWindow.webContents.send('template-upload', JSON.parse(content));
              } catch (error) {
                dialog.showErrorBox('Error', 'Failed to load template file');
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Print',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.print({
              silent: false,
              printBackground: true,
              deviceName: '',
              color: false,
              margins: {
                marginType: 'none'
              },
              landscape: true,
              scaleFactor: 100,
              pageSize: { width: 205000, height: 93000 }, // microns
              dpi: {
                horizontal: 300,
                vertical: 300
              }
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Theme',
          submenu: [
            {
              label: 'Light Mode',
              click: () => mainWindow.webContents.send('theme-change', 'light')
            },
            {
              label: 'Dark Mode', 
              click: () => mainWindow.webContents.send('theme-change', 'dark')
            },
            {
              label: 'System Default',
              click: () => mainWindow.webContents.send('theme-change', 'system')
            }
          ]
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'Check Printing System',
              detail: `Professional bank check printing application\nVersion ${packageJson.version}\nAuthor: ${packageJson.author}`
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  
  // IPC handlers with security validation
  ipcMain.handle('save-template', async (event, template) => {
    // Validate template structure
    if (!template || typeof template !== 'object' || !template.name) {
      return { success: false, error: 'Invalid template data' };
    }
    
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      defaultPath: path.basename(template.name.replace(/[^a-zA-Z0-9]/g, '_')) + '.json'
    });
    
    if (!result.canceled) {
      try {
        // Validate file path is safe
        const normalizedPath = path.normalize(result.filePath);
        if (!normalizedPath.endsWith('.json')) {
          return { success: false, error: 'Invalid file extension' };
        }
        
        fs.writeFileSync(normalizedPath, JSON.stringify(template, null, 2));
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Failed to save file' };
      }
    }
    return { success: false };
  });

  ipcMain.handle('print-check', async () => {
    try {
      await mainWindow.webContents.print({
        silent: false,
        printBackground: true,
        color: false,
        margins: { marginType: 'none' },
        landscape: true,
        scaleFactor: 100,
        pageSize: { width: 205000, height: 93000 }, // microns
        dpi: {
          horizontal: 300,
          vertical: 300
        }
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('load-template', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    
    if (!result.canceled) {
      try {
        // Validate file path is safe
        const filePath = result.filePaths[0];
        const normalizedPath = path.normalize(filePath);
        
        if (!normalizedPath.endsWith('.json')) {
          return { success: false, error: 'Invalid file type' };
        }
        
        const content = fs.readFileSync(normalizedPath, 'utf8');
        const template = JSON.parse(content);
        
        // Basic template validation
        if (!template || typeof template !== 'object') {
          return { success: false, error: 'Invalid template format' };
        }
        
        return { success: true, template };
      } catch (error) {
        return { success: false, error: 'Failed to load template' };
      }
    }
    return { success: false };
  });
  
  // Auto-updater setup
  const isDev = !app.isPackaged;
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
    
    autoUpdater.on('update-available', () => {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: 'A new version is available. It will be downloaded in the background.',
        buttons: ['OK']
      });
    });
    
    autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. The application will restart to apply the update.',
        buttons: ['Restart Now', 'Later']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});