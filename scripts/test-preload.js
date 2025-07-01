import { join, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Testing preload script configuration...');

// Check if the preload script exists in the expected location
const preloadPath = join(__dirname, '..', 'dist-electron', 'index.js');
const mainPath = join(__dirname, '..', 'dist-electron', 'main.js');

console.log(`📁 Preload script path: ${preloadPath}`);
console.log(`📁 Main script path: ${mainPath}`);

if (existsSync(preloadPath)) {
  console.log('✅ Preload script found!');
} else {
  console.log('❌ Preload script not found!');
}

if (existsSync(mainPath)) {
  console.log('✅ Main script found!');
} else {
  console.log('❌ Main script not found!');
}

// Check the main.js file to see the preload path configuration
const mainContent = readFileSync(mainPath, 'utf8');

// Look for the preload path in the main.js file
const preloadPathMatch = mainContent.match(/preload:\s*join\(__dirname,\s*['"`]([^'"`]+)['"`]\)/);
if (preloadPathMatch) {
  console.log(`🔧 Preload path in main.js: ${preloadPathMatch[1]}`);
  
  // Check if this path would resolve correctly
  const resolvedPath = join(__dirname, '..', 'dist-electron', preloadPathMatch[1]);
  console.log(`🔧 Resolved preload path: ${resolvedPath}`);
  
  if (existsSync(resolvedPath)) {
    console.log('✅ Resolved preload path exists!');
  } else {
    console.log('❌ Resolved preload path does not exist!');
  }
} else {
  console.log('❌ Could not find preload path in main.js');
}

console.log('🎉 Preload script test completed!'); 