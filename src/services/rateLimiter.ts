// Rate limiter service for image requests
// Implements a token bucket algorithm to ensure we never exceed 250 requests per minute

interface RateLimiterConfig {
  maxRequestsPerMinute: number;
  burstSize?: number; // Maximum burst of requests allowed (currently unused but kept for future use)
}

class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per millisecond
  private queue: Array<() => void> = [];
  private isProcessing = false;

  constructor(config: RateLimiterConfig) {
    this.maxTokens = config.maxRequestsPerMinute;
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    this.refillRate = config.maxRequestsPerMinute / (60 * 1000); // tokens per millisecond
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      this.refillTokens();
      
      if (this.tokens >= 1) {
        const resolve = this.queue.shift();
        if (resolve) {
          this.tokens -= 1;
          resolve();
        }
      } else {
        // Wait for tokens to refill
        const waitTime = (1 - this.tokens) / this.refillRate;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    this.isProcessing = false;
  }

  async acquire(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  // Get current status for debugging
  getStatus() {
    this.refillTokens();
    return {
      tokens: this.tokens,
      maxTokens: this.maxTokens,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing
    };
  }
}

// Global rate limiter instance for image requests
const imageRateLimiter = new RateLimiter({
  maxRequestsPerMinute: 250
});

export { imageRateLimiter, RateLimiter };
export type { RateLimiterConfig }; 