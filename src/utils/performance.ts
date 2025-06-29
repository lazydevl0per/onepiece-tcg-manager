interface PerformanceMetrics {
  resizeTime: number;
  renderTime: number;
  layoutTime: number;
  paintTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private isMonitoring = false;

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.metrics = [];
    
    // Monitor resize events
    let resizeStartTime = 0;
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const handleResizeStart = () => {
      resizeStartTime = globalThis.performance.now();
    };
    
    const handleResizeEnd = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      resizeTimeout = setTimeout(() => {
        const resizeTime = globalThis.performance.now() - resizeStartTime;
        this.recordMetric({ resizeTime, renderTime: 0, layoutTime: 0, paintTime: 0 });
      }, 100);
    };
    
    window.addEventListener('resize', handleResizeStart, { passive: true });
    window.addEventListener('resize', handleResizeEnd, { passive: true });
    
    // Monitor layout and paint performance
    if ('PerformanceObserver' in globalThis) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            const layoutTime = entry.startTime;
            this.recordMetric({ resizeTime: 0, renderTime: 0, layoutTime, paintTime: 0 });
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  stopMonitoring() {
    this.isMonitoring = false;
  }

  private recordMetric(metric: Partial<PerformanceMetrics>) {
    this.metrics.push({
      resizeTime: 0,
      renderTime: 0,
      layoutTime: 0,
      paintTime: 0,
      ...metric
    });
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  getAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return { resizeTime: 0, renderTime: 0, layoutTime: 0, paintTime: 0 };
    }
    
    const sum = this.metrics.reduce((acc, metric) => ({
      resizeTime: acc.resizeTime + metric.resizeTime,
      renderTime: acc.renderTime + metric.renderTime,
      layoutTime: acc.layoutTime + metric.layoutTime,
      paintTime: acc.paintTime + metric.paintTime
    }), { resizeTime: 0, renderTime: 0, layoutTime: 0, paintTime: 0 });
    
    const count = this.metrics.length;
    return {
      resizeTime: sum.resizeTime / count,
      renderTime: sum.renderTime / count,
      layoutTime: sum.layoutTime / count,
      paintTime: sum.paintTime / count
    };
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }

  logPerformanceReport() {
    const avg = this.getAverageMetrics();
    // eslint-disable-next-line no-console
    console.log('Performance Report:', {
      totalResizeEvents: this.metrics.length,
      averageResizeTime: `${avg.resizeTime.toFixed(2)}ms`,
      averageLayoutTime: `${avg.layoutTime.toFixed(2)}ms`,
      averageRenderTime: `${avg.renderTime.toFixed(2)}ms`,
      averagePaintTime: `${avg.paintTime.toFixed(2)}ms`
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Development helper to start monitoring automatically
if (typeof globalThis.process !== 'undefined' && globalThis.process.env.NODE_ENV === 'development') {
  performanceMonitor.startMonitoring();
  
  // Log performance report every 30 seconds in development
  setInterval(() => {
    performanceMonitor.logPerformanceReport();
  }, 30000);
} 