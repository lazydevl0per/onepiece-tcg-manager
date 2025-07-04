import { app, BrowserWindow, shell, dialog, ipcMain } from 'electron'
import pkg from 'electron-updater'
const { autoUpdater } = pkg
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createServer, Server } from 'http'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

// Custom environment detection
function isDevelopment(): boolean {
  // Check if we're in a packaged app
  if (app.isPackaged) {
    return false
  }
  
  // In development mode, the app path is the project root
  // In production, it would be the packaged app directory
  const appPath = app.getAppPath()
  
  // If we're running from the project root (not packaged), we're in development
  // This works for both electron-vite dev mode and when running from source
  return !appPath.includes('node_modules') && !appPath.includes('app.asar')
}

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
      const isDev = isDevelopment()
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
  if (isDevelopment() && process.env['ELECTRON_RENDERER_URL']) {
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
  console.log('Auto-updater setup:', {
    isDev: isDevelopment(),
    isPackaged: app.isPackaged,
    portableDir: process.env.PORTABLE_EXECUTABLE_DIR
  })
  
  // Disable auto-updater in development mode
  if (isDevelopment()) {
    console.log('Auto-updater disabled in development mode')
    updateStatus.error = 'Update checking not available in development mode'
    return
  }

  // Check if we're running from an installed app (not portable)
  const isPortable = process.env.PORTABLE_EXECUTABLE_DIR
  if (isPortable) {
    console.log('Auto-updater disabled for portable builds')
    updateStatus.error = 'Update checking not available for portable builds'
    return
  }

  // Check if we're in a proper installed environment
  if (!app.isPackaged) {
    console.log('Auto-updater disabled for unpackaged builds')
    updateStatus.error = 'Update checking requires a packaged application'
    return
  }

  try {
    // Configure electron-updater
    autoUpdater.autoDownload = false; // Don't auto-download, let user choose
    autoUpdater.autoInstallOnAppQuit = true;
    
    // Set update server (electron-updater will automatically detect GitHub releases)
    // No need to set feedURL for GitHub releases, it's automatic based on package.json

    // Check for updates every 4 hours
    setInterval(() => {
      checkForUpdatesSafely()
    }, 4 * 60 * 60 * 1000)

    // Check for updates on app start (with delay to ensure app is ready)
    setTimeout(() => {
      checkForUpdatesSafely()
    }, 5000)

    // Auto-updater events
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for updates...')
      updateStatus.checking = true
      updateStatus.error = null
    })

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info.version)
      updateStatus.checking = false
      updateStatus.available = true
      updateStatus.error = null
      
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) is available. Would you like to download it now?`,
        buttons: ['Download', 'Later']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate()
        }
      })
    })

    autoUpdater.on('update-not-available', (info) => {
      console.log('Update not available:', info.version)
      updateStatus.checking = false
      updateStatus.available = false
      updateStatus.error = null
    })

    autoUpdater.on('error', (err: Error) => {
      console.error('Auto-updater error:', err)
      updateStatus.checking = false
      updateStatus.error = err.message
      
      // Don't show error dialog for common issues like network problems
      if (!err.message.includes('ENOTFOUND') && !err.message.includes('net::')) {
        dialog.showErrorBox('Update Error', `Failed to check for updates: ${err.message}`)
      }
    })

    autoUpdater.on('download-progress', (progressObj) => {
      console.log(`Download progress: ${progressObj.percent}%`)
    })

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info.version)
      updateStatus.downloaded = true
      updateStatus.error = null
      
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: `Update ${info.version} has been downloaded. The application will restart to install the update.`,
        buttons: ['Restart Now', 'Later']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
    })

  } catch (error) {
    console.error('Failed to setup auto-updater:', error)
    updateStatus.error = 'Failed to initialize update checker'
  }
}

// Safe wrapper for checkForUpdates to handle errors
function checkForUpdatesSafely(): void {
  try {
    // Check if we're in a proper installed environment
    if (isDevelopment()) {
      console.log('Skipping update check in development mode')
      updateStatus.checking = false
      updateStatus.error = 'Update checking not available in development mode'
      return
    }
    
    // Check if we're in a packaged app
    if (!app.isPackaged) {
      console.log('Skipping update check for unpackaged builds')
      updateStatus.checking = false
      updateStatus.error = 'Update checking requires a packaged application'
      return
    }
    
    autoUpdater.checkForUpdates()
  } catch (error) {
    console.error('Error checking for updates:', error)
    updateStatus.checking = false
    updateStatus.error = error instanceof Error ? error.message : 'Unknown error'
  }
}

// IPC handlers for update checking
function setupUpdateHandlers(): void {
  ipcMain.handle('check-for-updates', async () => {
    if (isDevelopment()) {
      return { success: false, message: 'Update checking is disabled in development mode' }
    }
    
    if (!app.isPackaged) {
      return { success: false, message: 'Update checking requires a packaged application' }
    }
    
    try {
      checkForUpdatesSafely()
      return { success: true, message: 'Checking for updates...' }
    } catch (error) {
      return { success: false, message: `Failed to check for updates: ${error}` }
    }
  })

  ipcMain.handle('get-update-status', async () => {
    const status = {
      ...updateStatus,
      isDev: isDevelopment()
    }
    
    return status
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