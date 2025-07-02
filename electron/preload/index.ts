import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Add any custom APIs here
  getAppVersion: () => process.versions.app,
  getNodeVersion: () => process.versions.node,
  getChromeVersion: () => process.versions.chrome,
  getElectronVersion: () => process.versions.electron,
  isElectron: () => true,
  
  // New API for card image caching
  getCardImagePath: async (imageUrl: string): Promise<string> => {
    return await ipcRenderer.invoke('get-card-image-path', imageUrl)
  },
  
  // New API to check if image is already cached
  isImageCached: async (imageUrl: string): Promise<boolean> => {
    return await ipcRenderer.invoke('is-image-cached', imageUrl)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
} 