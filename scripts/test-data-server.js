import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simulate the data server from main.ts
function startTestDataServer() {
  const port = 3001;
  
  console.log('🧪 Starting test data server...');
  console.log(`📁 Current directory: ${__dirname}`);
  
  const server = createServer(async (req, res) => {
    try {
      if (!req.url) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      // Remove leading slash and decode URL
      const filePath = decodeURIComponent(req.url.substring(1));
      
      console.log(`📄 Request: ${req.url} -> ${filePath}`);
      
      // Security: only allow access to data directory
      if (!filePath.startsWith('data/')) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      // Construct full path to the data file
      // Simulate production path
      const basePath = join(__dirname, '..', 'dist');
      const fullPath = join(basePath, filePath);
      
      console.log(`📂 Base path: ${basePath}`);
      console.log(`📂 Full path: ${fullPath}`);
      console.log(`📂 File exists: ${existsSync(fullPath)}`);
      
      if (!existsSync(fullPath)) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }

      const content = await readFile(fullPath);
      
      // Set appropriate content type
      if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      }
      
      res.writeHead(200);
      res.end(content);
      
      console.log(`✅ Served: ${filePath}`);
    } catch (error) {
      console.error('❌ Error serving data file:', error);
      res.writeHead(500);
      res.end('Internal server error');
    }
  });

  server.listen(port, () => {
    console.log(`✅ Test data server running on port ${port}`);
    console.log('🌐 Test URLs:');
    console.log(`   http://localhost:${port}/data/english/json/packs.json`);
    console.log(`   http://localhost:${port}/data/english/json/cards_569001.json`);
  });
  
  return server;
}

// Test the server
async function testDataServer() {
  console.log('🧪 Testing data server functionality...\n');
  
  const server = startTestDataServer();
  
  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Test fetching packs.json
    console.log('\n📡 Testing packs.json...');
    const response = await fetch('http://localhost:3001/data/english/json/packs.json');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Successfully fetched packs.json with ${data.length} packs`);
    } else {
      console.log(`❌ Failed to fetch packs.json: ${response.status}`);
    }
    
    // Test fetching a card file
    console.log('\n📡 Testing cards_569001.json...');
    const cardResponse = await fetch('http://localhost:3001/data/english/json/cards_569001.json');
    if (cardResponse.ok) {
      const cardData = await cardResponse.json();
      console.log(`✅ Successfully fetched cards_569001.json with ${cardData.length} cards`);
    } else {
      console.log(`❌ Failed to fetch cards_569001.json: ${cardResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing data server:', error);
  } finally {
    server.close();
    console.log('\n🏁 Test completed, server closed');
  }
}

// Run the test
testDataServer().catch(console.error); 