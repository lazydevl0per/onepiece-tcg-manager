#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

// Check if ImageMagick is installed and get the correct command
function getImageMagickCommand() {
  const commands = ['magick', 'convert', 'imagemagick'];
  
  for (const cmd of commands) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      return cmd;
    } catch {
      // Try with magick convert syntax
      try {
        execSync(`${cmd} convert --version`, { stdio: 'ignore' });
        return cmd;
      } catch {
        continue;
      }
    }
  }
  
  return null;
}

// Generate icons using ImageMagick
async function generateIcons() {
  const sourceIcon = 'resources/icon.png';
  
  if (!existsSync(sourceIcon)) {
    console.error('Source icon not found:', sourceIcon);
    console.log('Creating a placeholder icon...');
    
    // Create a simple placeholder icon if none exists
    try {
      const placeholderSvg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#1e40af"/>
        <text x="256" y="256" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dy=".3em">OP</text>
      </svg>`;
      
      writeFileSync('resources/icon.svg', placeholderSvg);
      
      // Convert SVG to PNG if ImageMagick is available
      const magickCmd = getImageMagickCommand();
      if (magickCmd) {
        execSync(`${magickCmd} convert resources/icon.svg resources/icon.png`);
        console.log('✓ Created placeholder icon.png from SVG');
      } else {
        console.log('⚠ ImageMagick not found, using SVG as icon');
        return;
      }
    } catch (error) {
      console.error('Failed to create placeholder icon:', error.message);
      return;
    }
  }

  const magickCmd = getImageMagickCommand();
  if (!magickCmd) {
    console.error('ImageMagick is required to generate icons. Please install it first.');
    console.error('Windows: https://imagemagick.org/script/download.php#windows');
    console.error('macOS: brew install imagemagick');
    console.error('Linux: sudo apt-get install imagemagick');
    console.log('⚠ Skipping icon generation');
    return;
  }

  console.log('Generating icons...');

  // Generate Windows ICO (16x16, 32x32, 48x48, 256x256)
  try {
    if (magickCmd === 'magick') {
      execSync(`magick convert "${sourceIcon}" -define icon:auto-resize=16,32,48,256 "resources/icon.ico"`);
    } else {
      execSync(`convert "${sourceIcon}" -define icon:auto-resize=16,32,48,256 "resources/icon.ico"`);
    }
    console.log('✓ Generated icon.ico');
  } catch (error) {
    console.error('Failed to generate icon.ico:', error.message);
  }

  // Generate macOS ICNS
  try {
    // Create temporary directory for icon sizes
    const tempDir = 'temp_icons';
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir);
    }

    // Generate different sizes
    const sizes = [16, 32, 64, 128, 256, 512, 1024];
    for (const size of sizes) {
      if (magickCmd === 'magick') {
        execSync(`magick convert "${sourceIcon}" -resize ${size}x${size} "${tempDir}/icon_${size}.png"`);
      } else {
        execSync(`convert "${sourceIcon}" -resize ${size}x${size} "${tempDir}/icon_${size}.png"`);
      }
    }

    // Create ICNS file (requires iconutil on macOS)
    if (process.platform === 'darwin') {
      // Create iconset directory
      const iconsetDir = 'resources/icon.iconset';
      if (!existsSync(iconsetDir)) {
        mkdirSync(iconsetDir);
      }

      // Copy files to iconset with proper naming
      execSync(`cp "${tempDir}/icon_16.png" "${iconsetDir}/icon_16x16.png"`);
      execSync(`cp "${tempDir}/icon_32.png" "${iconsetDir}/icon_16x16@2x.png"`);
      execSync(`cp "${tempDir}/icon_32.png" "${iconsetDir}/icon_32x32.png"`);
      execSync(`cp "${tempDir}/icon_64.png" "${iconsetDir}/icon_32x32@2x.png"`);
      execSync(`cp "${tempDir}/icon_128.png" "${iconsetDir}/icon_128x128.png"`);
      execSync(`cp "${tempDir}/icon_256.png" "${iconsetDir}/icon_128x128@2x.png"`);
      execSync(`cp "${tempDir}/icon_256.png" "${iconsetDir}/icon_256x256.png"`);
      execSync(`cp "${tempDir}/icon_512.png" "${iconsetDir}/icon_256x256@2x.png"`);
      execSync(`cp "${tempDir}/icon_512.png" "${iconsetDir}/icon_512x512.png"`);
      execSync(`cp "${tempDir}/icon_1024.png" "${iconsetDir}/icon_512x512@2x.png"`);

      // Generate ICNS
      execSync(`iconutil -c icns "${iconsetDir}" -o "resources/icon.icns"`);
      console.log('✓ Generated icon.icns');
    } else {
      console.log('⚠ icon.icns generation skipped (requires macOS)');
    }

    // Clean up temp directory
    execSync(`rm -rf "${tempDir}"`);
  } catch (error) {
    console.error('Failed to generate icon.icns:', error.message);
  }

  console.log('Icon generation complete!');
}

generateIcons(); 