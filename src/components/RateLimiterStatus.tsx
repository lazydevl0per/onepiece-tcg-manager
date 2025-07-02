import { useState, useEffect } from 'react';

interface RateLimiterStatusProps {
  isVisible?: boolean;
}

interface RateLimiterStatus {
  tokens: number;
  maxTokens: number;
  queueLength: number;
  isProcessing: boolean;
}

export default function RateLimiterStatus({ isVisible = false }: RateLimiterStatusProps) {
  const [status, setStatus] = useState<RateLimiterStatus | null>(null);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if we're in Electron
    setIsElectron(!!(window as typeof window & { api?: unknown }).api);
  }, []);

  useEffect(() => {
    if (!isVisible || !isElectron) return;

    const updateStatus = async () => {
      try {
        const api = (window as typeof window & { api?: { getRateLimiterStatus?: () => Promise<RateLimiterStatus> } }).api;
        if (api?.getRateLimiterStatus) {
          const currentStatus = await api.getRateLimiterStatus();
          setStatus(currentStatus);
        }
      } catch (error) {
        console.error('Error getting rate limiter status:', error);
      }
    };

    // Update status immediately
    updateStatus();

    // Update status every 2 seconds
    const interval = setInterval(updateStatus, 2000);

    return () => clearInterval(interval);
  }, [isVisible, isElectron]);

  if (!isVisible || !isElectron || !status) {
    return null;
  }

  const tokenPercentage = (status.tokens / status.maxTokens) * 100;
  const queueColor = status.queueLength > 0 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50 text-xs text-slate-300 z-50">
      <div className="font-semibold text-slate-200 mb-2">Rate Limiter Status</div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Tokens:</span>
          <span className={tokenPercentage < 20 ? 'text-red-400' : 'text-green-400'}>
            {status.tokens.toFixed(1)}/{status.maxTokens}
          </span>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              tokenPercentage < 20 ? 'bg-red-500' : 
              tokenPercentage < 50 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${tokenPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between">
          <span>Queue:</span>
          <span className={queueColor}>
            {status.queueLength} pending
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Processing:</span>
          <span className={status.isProcessing ? 'text-blue-400' : 'text-slate-400'}>
            {status.isProcessing ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
} 