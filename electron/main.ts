import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createServer, Server } from 'http'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create a simple HTTP server to serve data files
let dataServer: Server | null = null

function startDataServer(): void {
  const port = 3001
  
  // console.log('🚀 Starting data server...');
  // console.log(`📁 Resources path: ${process.resourcesPath}`);
  // console.log(`🔧 Is dev: ${is.dev}`);
  
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
      // In development, use the project root, in production use resourcesPath
      const isDev = is.dev
      const basePath = isDev ? join(__dirname, '..') : process.resourcesPath
      const fullPath = join(basePath, filePath)
      
      // Debug logging
      // console.log(`Data server request: ${req.url}`)
      // console.log(`Is dev: ${isDev}`)
      // console.log(`Base path: ${basePath}`)
      // console.log(`Full path: ${fullPath}`)
      // console.log(`File exists: ${existsSync(fullPath)}`)
      
      // List contents of basePath for debugging
      if (isDev) {
        // console.log(`Dev mode - __dirname: ${__dirname}`)
      } else {
        // console.log(`Production mode - resourcesPath: ${process.resourcesPath}`)
        try {
          fs.readdirSync(basePath); // Just call it for side effect if needed, or remove entirely if not needed
          // console.log(`Base path contents: ${baseContents.join(', ')}`);
        } catch (_error) {
          // console.log(`Error reading base path: ${(error as Error).message}`);
        }
      }
      
      if (!existsSync(fullPath)) {
        res.writeHead(404)
        res.end('File not found')
        return
      }

      const content = await readFile(fullPath)
      
      // Set appropriate content type
      if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json')
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png')
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg')
      }
      
      res.writeHead(200)
      res.end(content)
    } catch (_error) {
      // console.error('Error serving data file:', error)
      res.writeHead(500)
      res.end('Internal server error')
    }
  })

  dataServer.listen(port, () => {
    // console.log(`Data server running on port ${port}`)
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
      preload: join(__dirname, '../preload/index.js'),
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
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.onepiece.tcg.manager')

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