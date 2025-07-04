import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: 'electron/main.ts'
      },
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  preload: {
    build: {
      lib: {
        entry: 'electron/preload/index.ts'
      },
      rollupOptions: {
        external: ['electron']
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