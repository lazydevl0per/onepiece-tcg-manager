import { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';

export default function StorageStatus() {
  const [storageInfo, setStorageInfo] = useState<{
    collectionSize: number;
    decksSize: number;
    totalSize: number;
  } | null>(null);

  useEffect(() => {
    const updateStorageInfo = () => {
      setStorageInfo(StorageService.getStorageInfo());
    };

    updateStorageInfo();
    
    // Update storage info when storage changes
    const handleStorageChange = () => {
      updateStorageInfo();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
      StorageService.clearAllData();
      setStorageInfo(StorageService.getStorageInfo());
    }
  };

  if (!storageInfo) return null;

  return (
    <div className="bg-op-blue-medium/10 p-3 rounded-lg border border-op-gold-primary/20">
      <h4 className="font-semibold text-op-white-pure mb-2 text-sm">Storage Status</h4>
      <div className="space-y-1 text-xs text-op-blue-light">
        <p>Collection: {formatBytes(storageInfo.collectionSize)}</p>
        <p>Decks: {formatBytes(storageInfo.decksSize)}</p>
        <p>Total: {formatBytes(storageInfo.totalSize)}</p>
      </div>
      <button
        onClick={handleClearAllData}
        className="mt-2 text-xs text-op-red-bright hover:text-op-red-medium transition-colors"
      >
        Clear All Data
      </button>
    </div>
  );
} 