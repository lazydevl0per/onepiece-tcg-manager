export interface IElectronAPI {
  versions: Readonly<Record<string, string>>
  platform: string
}

export interface IAPI {
  getAppVersion: () => string
  getNodeVersion: () => string
  getChromeVersion: () => string
  getElectronVersion: () => string
  isElectron: () => boolean
  
  // Update checking APIs
  checkForUpdates: () => Promise<{ success: boolean; message?: string }>
  getUpdateStatus: () => Promise<{
    checking: boolean
    available: boolean
    downloaded: boolean
    error: string | null
    isDev: boolean
    downloadProgress: number
  }>
  quitAndInstall: () => Promise<{ success: boolean; message?: string }>
  downloadUpdate: () => Promise<{ success: boolean; message?: string }>
  triggerUpdateCheck: () => Promise<{ success: boolean; message?: string }>
  onDownloadProgress: (callback: (progress: number) => void) => void
  removeDownloadProgressListener: () => void
}

declare global {
  interface Window {
    electron: IElectronAPI
    api: IAPI
  }
} 