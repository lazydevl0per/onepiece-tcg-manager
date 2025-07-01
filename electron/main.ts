import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createServer, Server } from 'http'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { request } from 'https'

// Image caching rate limiting
let lastImageRequestTime = 0
const IMAGE_REQUEST_DELAY = 500 // 500ms between image requests

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
      // In development, use the project root, in production use resourcesPath
      const isDev = is.dev
      const basePath = isDev ? join(__dirname, '..') : process.resourcesPath
      const fullPath = join(basePath, filePath)
      
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
      res.writeHead(500)
      res.end('Internal server error')
    }
  })

  dataServer.listen(port, () => {})
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, 'preload/index.js'),
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

// IPC handler for card image caching with improved error handling
ipcMain.handle('get-card-image-path', async (_, imageUrl: string): Promise<string> => {
  try {
    // Extract filename from URL (e.g., "OP11-006.png" from "https://en.onepiece-cardgame.com/images/cardlist/card/OP11-006.png")
    const urlParts = imageUrl.split('/')
    const filename = urlParts[urlParts.length - 1].split('?')[0] // Remove query params
    
    // Create cache directory in user data
    const cacheDir = join(app.getPath('userData'), 'images')
    if (!existsSync(cacheDir)) {
      await mkdir(cacheDir, { recursive: true })
    }
    
    const cachePath = join(cacheDir, filename)
    
    // Check if image is already cached
    if (existsSync(cachePath)) {
      return `file://${cachePath}`
    }
    
    // Rate limiting for image requests
    const now = Date.now()
    const timeSinceLastRequest = now - lastImageRequestTime
    if (timeSinceLastRequest < IMAGE_REQUEST_DELAY) {
      await new Promise(resolve => setTimeout(resolve, IMAGE_REQUEST_DELAY - timeSinceLastRequest))
    }
    lastImageRequestTime = Date.now()
    
    // Fetch image from remote URL with timeout and retry logic
    const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
      const timeout = 10000 // 10 second timeout
      const req = request(imageUrl, { timeout }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch image: ${res.statusCode}`))
          return
        }
        
        const chunks: Buffer[] = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
      })
      
      req.on('error', (error: any) => {
        // Log the error but don't spam the console
        if (error.code === 'ETIMEDOUT') {
          console.warn(`Timeout fetching image: ${filename}`)
        } else {
          console.warn(`Network error fetching image: ${filename} - ${error.message}`)
        }
        reject(error)
      })
      
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })
      
      req.end()
    })
    
    // Save to cache
    await writeFile(cachePath, imageBuffer)
    
    return `file://${cachePath}`
  } catch (error) {
    // Silently fallback to original URL if caching fails
    // This prevents the app from crashing due to network issues
    return imageUrl
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here. 