#!/usr/bin/env node

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function testDataServer() {
  console.log('🌐 Testing data server...');
  
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      
      if (req.url === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        return;
      }
      
      // Test serving a JSON file
      if (req.url === '/test-data') {
        const testDataPath = join('data', 'english', 'json', 'packs.json');
        if (existsSync(testDataPath)) {
          try {
            const data = readFileSync(testDataPath, 'utf8');
            res.writeHead(200);
            res.end(data);
          } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to read test data' }));
          }
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Test data not found' }));
        }
        return;
      }
      
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    });
    
    server.listen(0, () => {
      const port = server.address().port;
      console.log(`✅ Test server started on port ${port}`);
      
      // Test the server
      const http = require('http');
      const testRequest = http.get(`http://localhost:${port}/health`, (response) => {
        let data = '';
        response.on('data', (chunk) => data += chunk);
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.status === 'ok') {
              console.log('✅ Health check passed');
              
              // Test data endpoint
              const dataRequest = http.get(`http://localhost:${port}/test-data`, (dataResponse) => {
                let dataContent = '';
                dataResponse.on('data', (chunk) => dataContent += chunk);
                dataResponse.on('end', () => {
                  try {
                    const parsedData = JSON.parse(dataContent);
                    console.log('✅ Data serving test passed');
                    server.close(() => {
                      console.log('✅ Data server test completed successfully');
                      resolve(true);
                    });
                  } catch (error) {
                    console.error('❌ Failed to parse served data:', error.message);
                    server.close(() => resolve(false));
                  }
                });
              });
              
              dataRequest.on('error', (error) => {
                console.error('❌ Data request failed:', error.message);
                server.close(() => resolve(false));
              });
            } else {
              console.error('❌ Health check failed');
              server.close(() => resolve(false));
            }
          } catch (error) {
            console.error('❌ Failed to parse health response:', error.message);
            server.close(() => resolve(false));
          }
        });
      });
      
      testRequest.on('error', (error) => {
        console.error('❌ Health request failed:', error.message);
        server.close(() => resolve(false));
      });
    });
    
    server.on('error', (error) => {
      console.error('❌ Server error:', error.message);
      resolve(false);
    });
  });
}

// Run the test
testDataServer().then((success) => {
  if (!success) {
    process.exit(1);
  }
}); 