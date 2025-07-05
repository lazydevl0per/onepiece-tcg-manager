import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

console.log('Preload script loaded!')

// Custom APIs for renderer
const api = {
  // Add any custom APIs here
  getAppVersion: () => process.versions.app,
  getNodeVersion: () => process.versions.node,
  getChromeVersion: () => process.versions.chrome,
  getElectronVersion: () => process.versions.electron,
  isElectron: () => true,
  
  // Update checking APIs
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  getUpdateStatus: () => {
    console.log('Preload: getUpdateStatus called')
    return ipcRenderer.invoke('get-update-status')
  },
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  triggerUpdateCheck: () => ipcRenderer.invoke('trigger-update-check'),
  
  // Download progress listener
  onDownloadProgress: (callback: (progress: number) => void) => {
    ipcRenderer.on('update-download-progress', (_, progress: number) => {
      callback(progress)
    })
  },
  
  // Update downloaded listener
  onUpdateDownloaded: (callback: (info: { version: string }) => void) => {
    ipcRenderer.on('update-downloaded', (_, info: { version: string }) => {
      callback(info)
    })
  },
  
  // Remove download progress listener
  removeDownloadProgressListener: () => {
    ipcRenderer.removeAllListeners('update-download-progress')
    ipcRenderer.removeAllListeners('update-downloaded')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    console.log('Preload: Exposing APIs via contextBridge')
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    console.log('Preload: APIs exposed successfully')
  } catch (error) {
    console.error('Preload: Failed to expose APIs:', error)
  }
} else {
  console.log('Preload: Exposing APIs directly to window')
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
} 