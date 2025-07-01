import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to copy directory recursively
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip images directory since we're using remote images
      if (entry.name === 'images') {
        console.log('⏭️  Skipping images directory (using remote images)');
        continue;
      }
      // Recursively copy subdirectories
      copyDir(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Main execution
try {
  const dataSrc = path.join(__dirname, '..', 'data');
  const dataDest = path.join(__dirname, '..', 'public', 'data');

  console.log('📁 Copying data directory to public folder...');
  console.log(`Source: ${dataSrc}`);
  console.log(`Destination: ${dataDest}`);

  // Remove existing data directory in public if it exists
  if (fs.existsSync(dataDest)) {
    fs.rmSync(dataDest, { recursive: true, force: true });
  }

  // Copy data directory
  copyDir(dataSrc, dataDest);

  console.log('✅ Data directory copied successfully!');
} catch (error) {
  console.error('❌ Error copying data directory:', error);
  process.exit(1);
} 