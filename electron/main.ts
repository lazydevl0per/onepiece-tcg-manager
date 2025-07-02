import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createServer, Server } from 'http'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { request } from 'https'

// Image caching rate limiting - using token bucket algorithm
// Maximum 250 requests per minute

// Token bucket rate limiter for image requests
class ImageRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per millisecond
  private queue: Array<() => void> = [];
  private isProcessing = false;

  constructor() {
    this.maxTokens = 250; // 250 requests per minute
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    this.refillRate = 250 / (60 * 1000); // tokens per millisecond
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      this.refillTokens();
      
      if (this.tokens >= 1) {
        const resolve = this.queue.shift();
        if (resolve) {
          this.tokens -= 1;
          resolve();
        }
      } else {
        // Wait for tokens to refill
        const waitTime = (1 - this.tokens) / this.refillRate;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    this.isProcessing = false;
  }

  async acquire(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  getStatus() {
    this.refillTokens();
    return {
      tokens: this.tokens,
      maxTokens: this.maxTokens,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing
    };
  }
}

const imageRateLimiter = new ImageRateLimiter();

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
    
    // Rate limiting for image requests using token bucket algorithm
    await imageRateLimiter.acquire()
    
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
      
      req.on('error', (error: unknown) => {
        // Log the error but don't spam the console
        const err = error as { code?: string; message?: string }
        if (err.code === 'ETIMEDOUT') {
          console.warn(`Timeout fetching image: ${filename}`)
        } else {
          console.warn(`Network error fetching image: ${filename} - ${err.message}`)
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
  } catch (_error) {
    // Silently fallback to original URL if caching fails
    // This prevents the app from crashing due to network issues
    return imageUrl
  }
})

// IPC handler to check if image is already cached (without downloading)
ipcMain.handle('is-image-cached', async (_, imageUrl: string): Promise<boolean> => {
  try {
    // Extract filename from URL - handle both file:// URLs and regular URLs
    let filename: string;
    
    if (imageUrl.startsWith('file://')) {
      // For file:// URLs, extract the filename from the path
      const pathParts = imageUrl.replace('file://', '').split(/[/\\]/);
      filename = pathParts[pathParts.length - 1].split('?')[0]; // Remove query params
    } else {
      // For regular URLs, extract filename from the URL
      const urlParts = imageUrl.split('/');
      filename = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
    }
    
    // Check cache directory in user data
    const cacheDir = join(app.getPath('userData'), 'images')
    const cachePath = join(cacheDir, filename)
    
    // Add debugging
    console.log(`🔍 Checking cache for: ${imageUrl}`)
    console.log(`  Filename: ${filename}`)
    console.log(`  Cache path: ${cachePath}`)
    console.log(`  Cache exists: ${existsSync(cachePath)}`)
    
    // Return true if file exists in cache
    return existsSync(cachePath)
  } catch (_error) {
    // If there's any error checking cache, assume not cached
    console.error('Error checking image cache:', _error)
    return false
  }
})

// IPC handler to get rate limiter status for debugging
ipcMain.handle('get-rate-limiter-status', async (): Promise<any> => {
  return imageRateLimiter.getStatus();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here. 