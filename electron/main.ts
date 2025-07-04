import { app, BrowserWindow, shell, autoUpdater, dialog, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createServer, Server } from 'http'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

function getFilename() {
  return fileURLToPath(import.meta.url)
}
function getDirname() {
  return dirname(getFilename())
}

// Create a simple HTTP server to serve data files
let dataServer: Server | null = null

function startDataServer(): void {
  const port = 3001
  
  dataServer = createServer(async (req, res) => {
    try {
      if (!req.url) {
        res.writeHead(404)
        res.end('Not found')
        return
      }

      // Remove leading slash and decode URL
      const filePath = decodeURIComponent(req.url.substring(1))
      
      // Security: only allow access to data directory
      if (!filePath.startsWith('data/')) {
        res.writeHead(403)
        res.end('Forbidden')
        return
      }

      // Construct full path to the data file
      // In development, use the project root, in production use the data in dist-electron
      const isDev = is.dev
      let basePath: string
      
      if (isDev) {
        basePath = join(getDirname(), '..')
      } else {
        // In production, data is in the same directory as main.js (dist-electron/data)
        basePath = getDirname()
      }
      
      const fullPath = join(basePath, filePath)
      
      if (!existsSync(fullPath)) {
        console.log('File not found:', fullPath)
        res.writeHead(404)
        res.end('File not found')
        return
      }

      const content = await readFile(fullPath)
      
      // Set appropriate content type
      if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json')
      }
      
      res.writeHead(200)
      res.end(content)
    } catch (error) {
      console.error('Server error:', error)
      res.writeHead(500)
      res.end('Internal server error')
    }
  })

  dataServer.listen(port, () => {
    console.log(`Data server running on port ${port}`)
  })
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(getDirname(), 'preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // Fixed: Load from the correct renderer build output directory
    // electron-vite outputs renderer to dist/ by default
    const htmlPath = join(getDirname(), '../dist/index.html')
    console.log('Loading HTML from:', htmlPath)
    console.log('HTML exists:', existsSync(htmlPath))
    mainWindow.loadFile(htmlPath)
  }
}

// Auto-updater configuration
const UPDATE_SERVER_URL = 'https://github.com/lazydevl0per/onepiece-tcg-manager/releases/latest/download'

// Update status tracking
let updateStatus = {
  checking: false,
  available: false,
  downloaded: false,
  error: null as string | null
}

function setupAutoUpdater(): void {
  // Only enable auto-updater in production builds
  if (is.dev) {
    console.log('Auto-updater disabled in development mode')
    
  }

  // Set the feed URL for the auto-updater
  autoUpdater.setFeedURL({
    url: UPDATE_SERVER_URL
  })

  // Check for updates every 4 hours
  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 4 * 60 * 60 * 1000)

  // Check for updates on app start
  autoUpdater.checkForUpdates()

  // Auto-updater events
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...')
    updateStatus.checking = true
    updateStatus.error = null
  })

  autoUpdater.on('update-available', () => {
    console.log('Update available')
    updateStatus.checking = false
    updateStatus.available = true
    updateStatus.error = null
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version is available. The update will be downloaded and installed automatically.',
      buttons: ['OK']
    })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('Update not available')
    updateStatus.checking = false
    updateStatus.available = false
    updateStatus.error = null
  })

  autoUpdater.on('error', (err: Error) => {
    console.error('Auto-updater error:', err)
    updateStatus.checking = false
    updateStatus.error = err.message
    dialog.showErrorBox('Update Error', `Failed to check for updates: ${err.message}`)
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded')
    updateStatus.downloaded = true
    updateStatus.error = null
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. The application will restart to install the update.',
      buttons: ['Restart Now', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })
}

// IPC handlers for update checking
function setupUpdateHandlers(): void {
  ipcMain.handle('check-for-updates', async () => {
    if (is.dev) {
      return { success: false, message: 'Update checking is disabled in development mode' }
    }
    
    try {
      autoUpdater.checkForUpdates()
      return { success: true, message: 'Checking for updates...' }
    } catch (error) {
      return { success: false, message: `Failed to check for updates: ${error}` }
    }
  })

  ipcMain.handle('get-update-status', async () => {
    return {
      ...updateStatus,
      isDev: is.dev
    }
  })

  ipcMain.handle('quit-and-install', async () => {
    if (updateStatus.downloaded) {
      autoUpdater.quitAndInstall()
      return { success: true }
    }
    return { success: false, message: 'No update is ready to install' }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.onepiece.tcg.manager')

  // Setup auto-updater
  setupAutoUpdater()
  
  // Setup update handlers
  setupUpdateHandlers()

  // Start data server for serving card data
  startDataServer()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/quick-start/tree/master/packages/main-process#devtools
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Clean up data server when app quits
app.on('before-quit', () => {
  if (dataServer) {
    dataServer.close()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.