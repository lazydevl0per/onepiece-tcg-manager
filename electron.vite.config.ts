import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist-electron',
      lib: {
        entry: 'electron/main.ts'
      },
      rollupOptions: {
        external: ['electron'],
        output: {
          entryFileNames: 'main.js'
        }
      }
    }
  },
  preload: {
    build: {
      outDir: 'dist-electron',
      lib: {
        entry: 'electron/preload/index.ts'
      },
      rollupOptions: {
        external: ['electron'],
        output: {
          entryFileNames: 'main.js'
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
    plugins: [react()],
    server: {
      port: 5173
    },
    publicDir: 'public',
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.json'],
    build: {
      outDir: 'dist-electron',
      rollupOptions: {
        input: 'index.html',
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    define: {
      __DATA_DIR__: JSON.stringify('/data')
    }
  }
}) 