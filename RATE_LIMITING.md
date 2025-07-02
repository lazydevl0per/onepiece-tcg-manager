# Rate Limiting Implementation

This document explains the rate limiting system implemented to ensure the app never exceeds 250 image requests per minute.

## Overview

The app implements a **token bucket algorithm** for rate limiting image requests. This ensures that:
- Maximum of 250 image requests per minute
- Smooth distribution of requests over time
- No sudden bursts that could overwhelm the server
- Proper queuing when the rate limit is reached

## Implementation Details

### Token Bucket Algorithm

The rate limiter uses a token bucket with the following characteristics:
- **Bucket capacity**: 250 tokens (representing 250 requests per minute)
- **Refill rate**: 250 tokens per minute (approximately 4.17 tokens per second)
- **Burst handling**: Small bursts are allowed for better user experience

### Components

#### 1. Rate Limiter Service (`src/services/rateLimiter.ts`)
- Implements the token bucket algorithm
- Provides `acquire()` method that waits for available tokens
- Includes status monitoring for debugging

#### 2. Electron Main Process (`electron/main.ts`)
- Contains the main rate limiter instance
- Applies rate limiting to image caching requests
- Provides IPC handlers for status monitoring

#### 3. Frontend Integration (`src/hooks/useCollection.ts`)
- Applies rate limiting to image preloading
- Logs rate limiter status during image loading
- Ensures consistent rate limiting across the app

#### 4. Monitoring Component (`src/components/RateLimiterStatus.tsx`)
- Displays real-time rate limiter status
- Shows token availability, queue length, and processing status
- Only visible during image loading operations

## How It Works

### Token Bucket Mechanics

1. **Token Refill**: Tokens are continuously refilled at a rate of 250 per minute
2. **Request Processing**: Each image request consumes 1 token
3. **Queue Management**: When no tokens are available, requests are queued
4. **Fair Distribution**: Requests are processed in FIFO order as tokens become available

### Request Flow

```
Image Request → Check Cache → If not cached → Acquire Rate Limit Token → Download Image
```

### Rate Limiting Scenarios

#### Normal Operation
- Tokens are available → Request proceeds immediately
- Rate: ~4.17 requests per second (250/minute)

#### High Load
- Tokens depleted → Request waits in queue
- Queue processes requests as tokens refill
- Maximum rate maintained at 250/minute

#### Burst Handling
- Small bursts (up to 10 requests) can be processed quickly
- Larger bursts are queued and processed at the rate limit

## Configuration

The rate limiter can be configured by modifying these parameters:

```typescript
const imageRateLimiter = new RateLimiter({
  maxRequestsPerMinute: 250,  // Maximum requests per minute
  burstSize: 10               // Maximum burst size
});
```

## Monitoring

### Console Logging
Rate limiter status is logged during image loading:
```
🔄 Rate limiter status: 245.8/250 tokens, queue: 0
```

### UI Monitoring
The `RateLimiterStatus` component shows:
- Current token count
- Queue length
- Processing status
- Visual indicators for token availability

### IPC Status
The main process provides rate limiter status via IPC:
```typescript
const status = await api.getRateLimiterStatus();
// Returns: { tokens: number, maxTokens: number, queueLength: number, isProcessing: boolean }
```

## Testing

A test script is available to verify rate limiting functionality:

```bash
node scripts/test-rate-limiter.js
```

This script:
- Simulates 300 image requests
- Verifies the rate never exceeds 250/minute
- Reports timing and compliance statistics

## Benefits

1. **Server Protection**: Prevents overwhelming the image server
2. **Reliable Operation**: Ensures consistent app performance
3. **User Experience**: Smooth image loading without sudden delays
4. **Scalability**: Handles growing card collections efficiently
5. **Monitoring**: Real-time visibility into rate limiting status

## Future Considerations

- **Adaptive Rate Limiting**: Could adjust based on server response times
- **Priority Queuing**: Important images (user-visible) could get priority
- **Retry Logic**: Failed requests could be retried with exponential backoff
- **Cache Warming**: Pre-load frequently accessed images during idle time

## Troubleshooting

### High Queue Length
If the queue length is consistently high:
- Check network connectivity
- Verify image server availability
- Consider increasing the rate limit (if server allows)

### Slow Image Loading
If images are loading slowly:
- Check rate limiter status
- Verify cache is working properly
- Monitor network performance

### Rate Limiter Not Working
If rate limiting isn't working:
- Check console for errors
- Verify rate limiter is properly imported
- Test with the provided test script 