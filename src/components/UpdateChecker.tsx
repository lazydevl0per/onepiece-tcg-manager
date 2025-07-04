import React, { useState, useEffect } from 'react'
import { CheckCircle, Download, AlertCircle, RefreshCw } from 'lucide-react'

interface UpdateStatus {
  checking: boolean
  available: boolean
  downloaded: boolean
  error: string | null
  isDev: boolean
}

interface UpdateCheckerProps {
  className?: string
}

export const UpdateChecker: React.FC<UpdateCheckerProps> = ({ className = '' }) => {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkForUpdates = async () => {
    if (!window.api?.checkForUpdates) return
    
    setIsChecking(true)
    try {
      const result = await window.api.checkForUpdates()
      if (result.success) {
        // Update status will be updated via the status check
        setTimeout(() => getUpdateStatus(), 1000)
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const getUpdateStatus = async () => {
    if (!window.api?.getUpdateStatus) return
    
    try {
      const status = await window.api.getUpdateStatus()
      setUpdateStatus(status)
    } catch (error) {
      console.error('Failed to get update status:', error)
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

  useEffect(() => {
    getUpdateStatus()
    
    // Check for updates every 30 minutes
    const interval = setInterval(getUpdateStatus, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (!updateStatus) {
    return null
  }

  // Don't show update checker in development mode
  if (updateStatus.isDev) {
    return null
  }

  const getStatusIcon = () => {
    if (updateStatus.error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    if (updateStatus.checking || isChecking) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
    }
    if (updateStatus.downloaded) {
      return <Download className="w-4 h-4 text-green-500" />
    }
    if (updateStatus.available) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const getStatusText = () => {
    if (updateStatus.error) {
      return 'Update check failed'
    }
    if (updateStatus.checking || isChecking) {
      return 'Checking for updates...'
    }
    if (updateStatus.downloaded) {
      return 'Update ready to install'
    }
    if (updateStatus.available) {
      return 'Update available'
    }
    return 'Up to date'
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {getStatusIcon()}
      <span className="text-gray-600">{getStatusText()}</span>
      
      {updateStatus.downloaded && (
        <button
          onClick={installUpdate}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Install
        </button>
      )}
      
      {!updateStatus.checking && !isChecking && !updateStatus.error && (
        <button
          onClick={checkForUpdates}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Check
        </button>
      )}
    </div>
  )
} 