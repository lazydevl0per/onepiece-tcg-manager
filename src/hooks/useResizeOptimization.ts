import { useEffect, useRef, useCallback } from 'react';

interface ResizeOptimizationOptions {
  throttleMs?: number;
  onResize?: (width: number, height: number) => void;
}

export function useResizeOptimization(options: ResizeOptimizationOptions = {}) {
  const { throttleMs = 100, onResize } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResizeTime = useRef<number>(0);

  const handleResize = useCallback(() => {
    const now = Date.now();
    
    // Throttle resize events to prevent excessive updates
    if (now - lastResizeTime.current < throttleMs) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastResizeTime.current = Date.now();
        if (onResize) {
          onResize(window.innerWidth, window.innerHeight);
        }
      }, throttleMs);
      
      return;
    }

    lastResizeTime.current = now;
    if (onResize) {
      onResize(window.innerWidth, window.innerHeight);
    }
  }, [throttleMs, onResize]);

  useEffect(() => {
    // Add passive event listener for better performance
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleResize]);

  // Return current dimensions
  return {
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  };
} 