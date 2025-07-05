import React, { useState, useEffect } from 'react'
import { CheckCircle, Download, AlertCircle, RefreshCw } from 'lucide-react'

interface UpdateStatus {
  checking: boolean
  available: boolean
  downloaded: boolean
  error: string | null
  isDev: boolean
  downloadProgress: number
}

interface UpdateCheckerProps {
  className?: string
}

export const UpdateChecker: React.FC<UpdateCheckerProps> = ({ className = '' }) => {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const checkForUpdates = async () => {
    if (!window.api?.checkForUpdates) return
    
    setIsChecking(true)
    try {
      const result = await window.api.checkForUpdates()
      if (result.success) {
        // Update status will be updated via the status check
        setTimeout(() => getUpdateStatus(), 1000)
      } else {
        console.log('Update check result:', result.message)
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const getUpdateStatus = async () => {
    console.log('UpdateChecker: getUpdateStatus called')
    console.log('UpdateChecker: window.api available:', !!window.api)
    console.log('UpdateChecker: window.api.getUpdateStatus available:', !!window.api?.getUpdateStatus)
    
    if (!window.api?.getUpdateStatus) {
      console.log('UpdateChecker: window.api.getUpdateStatus not available')
      // Set a fallback status when API is not available
      setUpdateStatus({
        checking: false,
        available: false,
        downloaded: false,
        error: 'API not available',
        isDev: false, // Don't assume dev mode, let the main process determine this
        downloadProgress: 0
      })
      return
    }
    
    try {
      console.log('UpdateChecker: Calling window.api.getUpdateStatus()...')
      const status = await window.api.getUpdateStatus()
      console.log('UpdateChecker: Received status:', status)
      setUpdateStatus(status)
    } catch (error) {
      console.error('UpdateChecker: Failed to get update status:', error)
      // Set fallback status on error
      setUpdateStatus({
        checking: false,
        available: false,
        downloaded: false,
        error: `Failed to get status: ${error}`,
        isDev: false, // Don't assume dev mode, let the main process determine this
        downloadProgress: 0
      })
    }
  }

  const installUpdate = async () => {
    if (!window.api?.quitAndInstall) return
    
    try {
      const result = await window.api.quitAndInstall()
      if (!result.success) {
        console.error('Failed to install update:', result.message)
      }
    } catch (error) {
      console.error('Failed to install update:', error)
    }
  }

  const downloadUpdate = async () => {
    if (!window.api?.downloadUpdate) return
    
    try {
      setDownloadProgress(0)
      const result = await window.api.downloadUpdate()
      if (!result.success) {
        console.error('Failed to download update:', result.message)
      }
    } catch (error) {
      console.error('Failed to download update:', error)
    }
  }

  useEffect(() => {
    console.log('UpdateChecker: Component mounted, getting initial status...')
    
    // Test if basic API is working
    console.log('UpdateChecker: Testing basic API...')
    console.log('UpdateChecker: window.api =', window.api)
    if (window.api?.getAppVersion) {
      console.log('UpdateChecker: Basic API test - app version:', window.api.getAppVersion())
    } else {
      console.log('UpdateChecker: Basic API not available!')
    }
    
    // Try to get status immediately
    getUpdateStatus()
    
    // If we don't get status within 2 seconds, try again (in case main process isn't ready)
    const retryTimeout = setTimeout(() => {
      if (!updateStatus) {
        console.log('UpdateChecker: Retrying status check after timeout...')
        getUpdateStatus()
      }
    }, 2000)
    
    // Check for updates on app start (after a short delay to ensure everything is ready)
    const startupCheckTimeout = setTimeout(async () => {
      console.log('UpdateChecker: Performing startup update check...')
      if (window.api?.triggerUpdateCheck) {
        try {
          const result = await window.api.triggerUpdateCheck()
          console.log('Startup update check result:', result)
        } catch (error) {
          console.error('Startup update check failed:', error)
        }
      } else {
        // Fallback to regular check if triggerUpdateCheck is not available
        checkForUpdates()
      }
    }, 3000)
    
    // Check for updates every 30 minutes
    const interval = setInterval(getUpdateStatus, 30 * 60 * 1000)
    
    // More frequent status checks during startup (first 10 seconds)
    const startupInterval = setInterval(getUpdateStatus, 1000)
    setTimeout(() => {
      clearInterval(startupInterval)
    }, 10000)
    
    // Setup download progress listener
    if (window.api?.onDownloadProgress) {
      window.api.onDownloadProgress((progress: number) => {
        console.log('Download progress:', progress)
        setDownloadProgress(progress)
      })
    }
    
    return () => {
      clearTimeout(retryTimeout)
      clearTimeout(startupCheckTimeout)
      clearInterval(interval)
      clearInterval(startupInterval)
      // Clean up download progress listener
      if (window.api?.removeDownloadProgressListener) {
        window.api.removeDownloadProgressListener()
      }
    }
  }, [])

  // Show only if we have status
  if (!updateStatus) {
    // Fallback: show a basic status if we don't have one yet
    return (
      <div className={`flex items-center gap-2 text-sm ${className} bg-slate-800/80 p-4 rounded-lg shadow-md w-full`}>
        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
        <span className="text-gray-600">Loading update status...</span>
        <button
          onClick={getUpdateStatus}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const displayStatus = updateStatus

  const getStatusIcon = () => {
    if (displayStatus.error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    if (displayStatus.checking || isChecking) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
    }
    if (displayStatus.downloaded) {
      return <Download className="w-4 h-4 text-green-500" />
    }
    if (displayStatus.available) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
    if (displayStatus.isDev) {
      return <CheckCircle className="w-4 h-4 text-gray-400" />
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const getStatusText = () => {
    if (displayStatus.error) {
      return `Update check failed: ${displayStatus.error}`
    }
    if (displayStatus.checking || isChecking) {
      return 'Checking for updates...'
    }
    if (displayStatus.downloaded) {
      return 'Update ready to install'
    }
    if (displayStatus.available && downloadProgress > 0 && downloadProgress < 100) {
      return `Downloading update... ${Math.round(downloadProgress)}%`
    }
    if (displayStatus.available) {
      return 'Update available'
    }
    if (displayStatus.isDev) {
      return 'Dev mode - updates disabled'
    }
    return 'Up to date'
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className} bg-slate-800/80 p-4 rounded-lg shadow-md w-full`}>
      {getStatusIcon()}
      <span className="text-gray-200 flex-1">{getStatusText()}</span>
      
      {displayStatus.downloaded && (
        <button
          onClick={installUpdate}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Install
        </button>
      )}
      
      {displayStatus.available && !displayStatus.downloaded && (
        <button
          onClick={downloadUpdate}
          disabled={downloadProgress > 0 && downloadProgress < 100}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            downloadProgress > 0 && downloadProgress < 100
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-yellow-500 text-white hover:bg-yellow-600'
          }`}
        >
          {downloadProgress > 0 && downloadProgress < 100 ? 'Downloading...' : 'Download'}
        </button>
      )}
      
      {!displayStatus.checking && !isChecking && !displayStatus.error && !displayStatus.available && !displayStatus.isDev && (
        <button
          onClick={checkForUpdates}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Check
        </button>
      )}
      
      {displayStatus.isDev && (
        <button
          onClick={checkForUpdates}
          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          disabled
        >
          Check
        </button>
      )}
    </div>
  )
} 