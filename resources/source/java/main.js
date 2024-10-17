const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron')
const path = require('path')

let tray = null
let mainWindow = null

function createWindow () {
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'icons', 'favicons', 'favicon1.png')
  const icon = nativeImage.createFromPath(iconPath)

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: icon
  })

  mainWindow.loadFile(path.join(__dirname, '..', '..', 'index.html'))

  // Send the icon to the renderer process
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('set-titlebar-icon', icon.toDataURL())
  })

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })
}

function createTray() {
  tray = new Tray(path.join(__dirname, '..', '..', 'assets', 'icons', 'favicons', 'favicon1.ico'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'SHOW', click: () => mainWindow.show() },
    { label: 'MINIMIZE', click: () => mainWindow.hide() },
    { type: 'separator' },
    { label: 'QUIT', click: () => {
      app.isQuitting = true
      app.quit()
    }}
  ])
  tray.setToolTip('AtomSuite Boilerplate')
  tray.setContextMenu(contextMenu)

  // Add left-click event to show/minimize the app
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })
}

app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Add any IPC handlers here
ipcMain.handle('ping', () => 'pong')

// Add handlers for window controls
ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.hide()
})

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.handle('close-window', () => {
  app.isQuitting = true
  app.quit()
})
