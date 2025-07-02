// Test script to verify rate limiter functionality
// This script simulates image requests to ensure we don't exceed 250 per minute

const { RateLimiter } = require('../src/services/rateLimiter.ts');

async function testRateLimiter() {
  console.log('🧪 Testing Rate Limiter...');
  
  const rateLimiter = new RateLimiter({
    maxRequestsPerMinute: 250,
    burstSize: 10
  });

  const startTime = Date.now();
  const totalRequests = 300; // Test with 300 requests
  const results = [];

  console.log(`📊 Testing ${totalRequests} requests with 250/minute limit...`);

  for (let i = 0; i < totalRequests; i++) {
    const requestStart = Date.now();
    
    // Acquire permission from rate limiter
    await rateLimiter.acquire();
    
    const requestEnd = Date.now();
    const requestTime = requestEnd - requestStart;
    
    results.push({
      requestNumber: i + 1,
      timestamp: requestEnd - startTime,
      waitTime: requestTime
    });

    // Log progress every 50 requests
    if ((i + 1) % 50 === 0) {
      const elapsed = (requestEnd - startTime) / 1000;
      const rate = (i + 1) / (elapsed / 60);
      console.log(`  Request ${i + 1}/${totalRequests} - Elapsed: ${elapsed.toFixed(1)}s - Rate: ${rate.toFixed(1)}/min`);
    }
  }

  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  const actualRate = totalRequests / (totalTime / 60);

  console.log('\n📈 Results:');
  console.log(`  Total time: ${totalTime.toFixed(1)} seconds`);
  console.log(`  Actual rate: ${actualRate.toFixed(1)} requests/minute`);
  console.log(`  Target rate: 250 requests/minute`);
  console.log(`  Rate compliance: ${actualRate <= 250 ? '✅ PASS' : '❌ FAIL'}`);
  
  // Check if any requests were too fast (indicating rate limiting wasn't working)
  const minInterval = 60 / 250; // Minimum seconds between requests
  const tooFastRequests = results.filter(r => r.waitTime < minInterval * 1000).length;
  
  console.log(`  Requests without proper delay: ${tooFastRequests}`);
  console.log(`  Proper rate limiting: ${tooFastRequests === 0 ? '✅ PASS' : '❌ FAIL'}`);

  // Show some sample wait times
  console.log('\n⏱️ Sample wait times:');
  const samples = [1, 50, 100, 150, 200, 250, 300];
  samples.forEach(num => {
    if (num <= totalRequests) {
      const result = results[num - 1];
      console.log(`  Request ${num}: ${result.waitTime.toFixed(0)}ms wait`);
    }
  });

  return {
    totalTime,
    actualRate,
    isCompliant: actualRate <= 250,
    tooFastRequests
  };
}

// Run the test if this script is executed directly
if (require.main === module) {
  testRateLimiter()
    .then(results => {
      console.log('\n🎯 Test completed!');
      process.exit(results.isCompliant && results.tooFastRequests === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testRateLimiter }; 