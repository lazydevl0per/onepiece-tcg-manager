export interface IElectronAPI {
  versions: Readonly<Record<string, string>>
  platform: string
}

export interface IAPI {
  getAppVersion: () => string
  getNodeVersion: () => string
  getChromeVersion: () => string
  getElectronVersion: () => string
}

declare global {
  interface Window {
    electron: IElectronAPI
    api: IAPI
  }
} 