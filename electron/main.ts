import { app, BrowserWindow, shell, ipcMain } from 'electron'
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
    console.log('isDevelopment: app.isPackaged is true, returning false')
    return false
  }
  
  // Check for development environment variables
  if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV === 'true') {
    console.log('isDevelopment: NODE_ENV or ELECTRON_IS_DEV indicates development, returning true')
    return true
  }
  
  // In development mode, the app path is the project root
  // In production, it would be the packaged app directory
  const appPath = app.getAppPath()
  console.log('isDevelopment: appPath =', appPath)
  
  // Check if we're running from the project root (development)
  // In development, the app path should be the project root directory
  // In production builds, it would be the packaged app directory
  const isProjectRoot = !appPath.includes('app.asar') && 
                       !appPath.includes('resources') && 
                       !appPath.includes('dist-electron') &&
                       !appPath.includes('release')
  
  console.log('isDevelopment: returning', isProjectRoot)
  return isProjectRoot
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
  const preloadPath = join(getDirname(), 'preload/index.mjs')
  console.log('Creating window with preload path:', preloadPath)
  console.log('Preload file exists:', existsSync(preloadPath))
  
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
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
  error: null as string | null,
  isDev: false,
  downloadProgress: 0
}

function setupAutoUpdater(): void {
  console.log('Auto-updater setup: starting...')
  console.log('Auto-updater setup:', {
    isDev: isDevelopment(),
    isPackaged: app.isPackaged,
    portableDir: process.env.PORTABLE_EXECUTABLE_DIR
  })
  
  // Initialize status
  updateStatus.isDev = isDevelopment()
  console.log('Auto-updater setup: initialized updateStatus.isDev =', updateStatus.isDev)
  
  // Allow auto-updater in development mode for testing, but only if packaged
  if (isDevelopment() && !app.isPackaged) {
    console.log('Auto-updater disabled for development unpackaged builds')
    updateStatus.error = 'Update checking requires a packaged application'
    updateStatus.isDev = true
    updateStatus.checking = false
    updateStatus.available = false
    updateStatus.downloaded = false
    updateStatus.downloadProgress = 0
    console.log('Auto-updater setup: final updateStatus =', updateStatus)
    return
  }

  // Check if we're running from an installed app (not portable)
  const isPortable = process.env.PORTABLE_EXECUTABLE_DIR
  if (isPortable) {
    console.log('Auto-updater disabled for portable builds')
    updateStatus.error = 'Update checking not available for portable builds'
    updateStatus.isDev = false // Portable builds are production but with limitations
    return
  }

  // Check if we're in a proper installed environment
  if (!app.isPackaged) {
    console.log('Auto-updater disabled for unpackaged builds')
    updateStatus.error = 'Update checking requires a packaged application'
    updateStatus.isDev = true // Unpackaged builds are treated as dev
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
      console.log('Auto-updater: Performing startup update check...')
      checkForUpdatesSafely()
    }, 5000)
    
    // Also trigger an immediate check if we're in production mode
    if (!isDevelopment() && app.isPackaged) {
      console.log('Auto-updater: Triggering immediate update check for production...')
      setTimeout(() => {
        checkForUpdatesSafely()
      }, 1000)
    }

    // Auto-updater events
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for updates...')
      updateStatus.checking = true
      updateStatus.error = null
      updateStatus.downloadProgress = 0
    })

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info.version)
      updateStatus.checking = false
      updateStatus.available = true
      updateStatus.error = null
      updateStatus.downloadProgress = 0
      // Removed native dialog - UpdateChecker component will handle UI
    })

    autoUpdater.on('update-not-available', (info) => {
      console.log('Update not available:', info.version)
      updateStatus.checking = false
      updateStatus.available = false
      updateStatus.downloaded = false
      updateStatus.error = null
      updateStatus.downloadProgress = 0
      updateStatus.isDev = false // Ensure we're not in dev mode when updates work
    })

    autoUpdater.on('error', (err: Error) => {
      console.error('Auto-updater error:', err)
      updateStatus.checking = false
      updateStatus.error = err.message
      updateStatus.downloadProgress = 0
      // Removed native error dialog - UpdateChecker component will handle error display
    })

    autoUpdater.on('download-progress', (progressObj) => {
      console.log(`Download progress: ${progressObj.percent}%`)
      updateStatus.downloadProgress = progressObj.percent
      // Send progress update to renderer
      const windows = BrowserWindow.getAllWindows()
      windows.forEach(window => {
        if (!window.isDestroyed()) {
          window.webContents.send('update-download-progress', progressObj.percent)
        }
      })
    })

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info.version)
      updateStatus.downloaded = true
      updateStatus.downloadProgress = 100
      updateStatus.error = null
      // Send update-downloaded event to renderer
      const windows = BrowserWindow.getAllWindows()
      windows.forEach(window => {
        if (!window.isDestroyed()) {
          window.webContents.send('update-downloaded', { version: info.version })
        }
      })
    })

  } catch (error) {
    console.error('Failed to setup auto-updater:', error)
    updateStatus.error = 'Failed to initialize update checker'
    updateStatus.isDev = isDevelopment()
    updateStatus.checking = false
    updateStatus.available = false
    updateStatus.downloaded = false
    updateStatus.downloadProgress = 0
  }
}

// Safe wrapper for checkForUpdates to handle errors
function checkForUpdatesSafely(): void {
  try {
    // Check if we're in a packaged app
    if (!app.isPackaged) {
      console.log('Skipping update check for unpackaged builds')
      updateStatus.checking = false
      updateStatus.error = 'Update checking requires a packaged application'
      return
    }
    
    // Allow update checks in both development and production for testing
    // but log the environment
    if (isDevelopment()) {
      console.log('Update check in development mode (for testing)')
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
    // Allow manual update checks even in development for testing
    // but only if we're in a packaged app
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
    console.log('get-update-status called, current updateStatus:', updateStatus)
    console.log('isDevelopment():', isDevelopment())
    
    // Ensure we always have a valid status
    if (!updateStatus) {
      updateStatus = {
        checking: false,
        available: false,
        downloaded: false,
        error: null,
        isDev: isDevelopment(),
        downloadProgress: 0
      }
    }
    
    const status = {
      ...updateStatus,
      isDev: isDevelopment()
    }
    
    console.log('get-update-status returning:', status)
    return status
  })

  ipcMain.handle('quit-and-install', async () => {
    if (updateStatus.downloaded) {
      autoUpdater.quitAndInstall()
      return { success: true }
    }
    return { success: false, message: 'No update is ready to install' }
  })

  ipcMain.handle('download-update', async () => {
    if (updateStatus.available && !updateStatus.downloaded) {
      try {
        updateStatus.downloadProgress = 0
        autoUpdater.downloadUpdate()
        return { success: true, message: 'Download started...' }
      } catch (error) {
        return { success: false, message: `Failed to start download: ${error}` }
      }
    }
    return { success: false, message: 'No update available to download' }
  })
  
  // Add a handler for immediate update checks
  ipcMain.handle('trigger-update-check', async () => {
    console.log('Manual update check triggered from renderer')
    try {
      checkForUpdatesSafely()
      return { success: true, message: 'Update check triggered' }
    } catch (error) {
      return { success: false, message: `Failed to trigger update check: ${error}` }
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.onepiece.tcg.manager')

  // Ensure updateStatus is always initialized
  if (!updateStatus.isDev) {
    updateStatus.isDev = isDevelopment()
  }
  console.log('App ready: final updateStatus =', updateStatus)

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