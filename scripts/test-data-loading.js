#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

function testDataLoading() {
  console.log('🧪 Testing data loading...');
  
  const dataPath = 'data/english';
  const jsonPath = join(dataPath, 'json');
  const imagesPath = join(dataPath, 'images');
  
  // Check if data directories exist
  if (!existsSync(dataPath)) {
    console.error('❌ Data directory not found:', dataPath);
    return false;
  }
  
  if (!existsSync(jsonPath)) {
    console.error('❌ JSON directory not found:', jsonPath);
    return false;
  }
  
  if (!existsSync(imagesPath)) {
    console.error('❌ Images directory not found:', imagesPath);
    return false;
  }
  
  // Check JSON files
  try {
    const jsonFiles = readdirSync(jsonPath).filter(file => file.endsWith('.json'));
    console.log(`✅ Found ${jsonFiles.length} JSON files`);
    
    // Test loading a few JSON files
    const testFiles = jsonFiles.slice(0, 3);
    for (const file of testFiles) {
      const filePath = join(jsonPath, file);
      const content = readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      console.log(`✅ Successfully parsed ${file}`);
    }
  } catch (error) {
    console.error('❌ Error reading JSON files:', error.message);
    return false;
  }
  
  // Check image files
  try {
    const imageFiles = readdirSync(imagesPath, { recursive: true })
      .filter(file => typeof file === 'string' && file.match(/\.(webp|png|jpg|jpeg)$/i));
    console.log(`✅ Found ${imageFiles.length} image files`);
  } catch (error) {
    console.error('❌ Error reading image files:', error.message);
    return false;
  }
  
  console.log('✅ Data loading test completed successfully');
  return true;
}

// Run the test
if (!testDataLoading()) {
  process.exit(1);
} 