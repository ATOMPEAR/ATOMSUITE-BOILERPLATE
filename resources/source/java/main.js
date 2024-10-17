const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron')
const path = require('path')

let tray = null
let mainWindow = null

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, '..', '..', 'assets', 'icons', 'favicons', 'favicon1.ico')
  })
  
  mainWindow.loadFile(path.join(__dirname, '..', '..', 'index.html'))

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

ipcMain.handle('ping', () => 'pong')

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
