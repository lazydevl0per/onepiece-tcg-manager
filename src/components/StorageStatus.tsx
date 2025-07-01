import { useState, useEffect } from 'react';

export default function StorageStatus() {
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    const updateStorageInfo = () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then((estimate) => {
          if (estimate.usage && estimate.quota) {
            const used = estimate.usage;
            const total = estimate.quota;
            const percentage = (used / total) * 100;
            setStorageInfo({ used, total, percentage });
          }
        });
      }
    };

    updateStorageInfo();
    // Update every 30 seconds
    const interval = setInterval(updateStorageInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!storageInfo) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageColor = (percentage: number) => {
    if (percentage > 90) return 'text-red-400';
    if (percentage > 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-slate-600/10 p-3 rounded-lg border border-slate-500/20">
      <h4 className="font-semibold text-slate-50 mb-2 text-sm">Storage Status</h4>
      <div className="space-y-1 text-xs text-slate-300">
        <div className="flex items-center justify-between">
          <span>Used:</span>
          <span>{formatBytes(storageInfo.used)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Available:</span>
          <span>{formatBytes(storageInfo.total - storageInfo.used)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total:</span>
          <span>{formatBytes(storageInfo.total)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Usage:</span>
          <span className={getStorageColor(storageInfo.percentage)}>
            {storageInfo.percentage.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            storageInfo.percentage > 90 ? 'bg-red-400' :
            storageInfo.percentage > 70 ? 'bg-yellow-400' : 'bg-green-400'
          }`}
          style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
        />
      </div>
      <button
        onClick={() => {
          if ('storage' in navigator && 'clear' in navigator.storage) {
            (navigator.storage as any).clear();
            window.location.reload();
          }
        }}
        className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
      >
        Clear all data
      </button>
    </div>
  );
} 