import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test data loading in different scenarios
async function testDataLoading() {
  console.log('🧪 Testing data loading scenarios...\n');

  // Test 1: Check if data exists in dist directory
  console.log('1. Checking dist/data directory...');
  const distDataPath = path.join(__dirname, '..', 'dist', 'data');
  if (fs.existsSync(distDataPath)) {
    console.log('✅ dist/data directory exists');
    
    const jsonPath = path.join(distDataPath, 'data', 'english', 'json');
    if (fs.existsSync(jsonPath)) {
      const jsonFiles = fs.readdirSync(jsonPath).filter(f => f.endsWith('.json'));
      console.log(`✅ Found ${jsonFiles.length} JSON files in dist/data/data/english/json`);
    } else {
      console.log('❌ dist/data/data/english/json directory not found');
    }
    
    const imagesPath = path.join(distDataPath, 'data', 'english', 'images');
    if (fs.existsSync(imagesPath)) {
      const imageFiles = fs.readdirSync(imagesPath).filter(f => f.endsWith('.png'));
      console.log(`✅ Found ${imageFiles.length} PNG files in dist/data/data/english/images`);
    } else {
      console.log('❌ dist/data/data/english/images directory not found');
    }
  } else {
    console.log('❌ dist/data directory not found');
  }

  // Test 2: Check if data exists in public directory
  console.log('\n2. Checking public/data directory...');
  const publicDataPath = path.join(__dirname, '..', 'public', 'data');
  if (fs.existsSync(publicDataPath)) {
    console.log('✅ public/data directory exists');
    
    const jsonPath = path.join(publicDataPath, 'data', 'english', 'json');
    if (fs.existsSync(jsonPath)) {
      const jsonFiles = fs.readdirSync(jsonPath).filter(f => f.endsWith('.json'));
      console.log(`✅ Found ${jsonFiles.length} JSON files in public/data/data/english/json`);
    } else {
      console.log('❌ public/data/data/english/json directory not found');
    }
  } else {
    console.log('❌ public/data directory not found');
  }

  // Test 3: Check if data exists in original data directory
  console.log('\n3. Checking original data directory...');
  const originalDataPath = path.join(__dirname, '..', 'data');
  if (fs.existsSync(originalDataPath)) {
    console.log('✅ Original data directory exists');
    
    const jsonPath = path.join(originalDataPath, 'data', 'english', 'json');
    if (fs.existsSync(jsonPath)) {
      const jsonFiles = fs.readdirSync(jsonPath).filter(f => f.endsWith('.json'));
      console.log(`✅ Found ${jsonFiles.length} JSON files in original data/data/english/json`);
    } else {
      console.log('❌ Original data/data/english/json directory not found');
    }
  } else {
    console.log('❌ Original data directory not found');
  }

  // Test 4: Simulate Electron resources path structure
  console.log('\n4. Simulating Electron resources path...');
  const resourcesPath = path.join(__dirname, '..', 'dist', 'data');
  if (fs.existsSync(resourcesPath)) {
    console.log('✅ Resources path exists (simulated)');
    
    // Test if we can access a specific JSON file
    const testJsonPath = path.join(resourcesPath, 'data', 'english', 'json', 'packs.json');
    if (fs.existsSync(testJsonPath)) {
      try {
        const content = fs.readFileSync(testJsonPath, 'utf8');
        const data = JSON.parse(content);
        console.log(`✅ Successfully read packs.json with ${data.length} packs`);
      } catch (error) {
        console.log('❌ Failed to read/parse packs.json:', error.message);
      }
    } else {
      console.log('❌ packs.json not found in resources path');
    }
  } else {
    console.log('❌ Resources path not found');
  }

  console.log('\n🏁 Data loading test completed!');
}

// Run the test
testDataLoading().catch(console.error); 