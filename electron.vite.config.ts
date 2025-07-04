import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// Helper function to recursively copy directory
function copyDir(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true })
  }
  
  const entries = readdirSync(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

export default defineConfig({
  main: {
    build: {
      outDir: 'dist-electron',
      lib: {
        entry: 'electron/main.ts'
      },
      rollupOptions: {
        external: ['electron', 'electron-updater'],
        output: {
          entryFileNames: 'main.js'
        }
      }
    },
    plugins: [
      {
        name: 'copy-json-data',
        writeBundle() {
          // Copy data folder to dist-electron after build
          const sourceDir = 'data/english/json'
          const targetDir = 'dist-electron/data/english/json'
          
          if (existsSync(sourceDir)) {
            console.log('📁 Copying data folder to dist-electron...')
            try {
              copyDir(sourceDir, targetDir)
              console.log('✅ Data folder copied successfully!')
            } catch (error) {
              console.error('❌ Error copying data folder:', error)
            }
          } else {
            console.log('⚠️  Data folder not found at:', sourceDir)
          }
        }
      }
    ]
  },
  preload: {
    build: {
      outDir: 'dist-electron/preload',
      lib: {
        entry: 'electron/preload/index.ts'
      },
      rollupOptions: {
        external: ['electron'],
        output: {
          entryFileNames: 'index.js'
        }
      }
    }
  },
  renderer: {
    root: '.',
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    plugins: [
      react(),
      {
        name: 'copy-image-data',
        writeBundle() {
          // Copy data folder to dist-electron after build
          const sourceDir = 'data/english/images'
          const targetDir = 'dist/data/english/images'
          
          if (existsSync(sourceDir)) {
            console.log('📁 Copying data folder to dist...')
            try {
              copyDir(sourceDir, targetDir)
              console.log('✅ Data folder copied successfully!')
            } catch (error) {
              console.error('❌ Error copying data folder:', error)
            }
          } else {
            console.log('⚠️  Data folder not found at:', sourceDir)
          }
        }
      }
    ],
    server: {
      port: 5173
    },
    publicDir: false,
    build: {
      outDir: "dist",
      rollupOptions: {
        input: 'index.html',
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    }
  }
})