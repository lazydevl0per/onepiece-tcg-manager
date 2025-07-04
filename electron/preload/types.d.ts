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
  }>
  quitAndInstall: () => Promise<{ success: boolean; message?: string }>
}

declare global {
  interface Window {
    electron: IElectronAPI
    api: IAPI
  }
} 