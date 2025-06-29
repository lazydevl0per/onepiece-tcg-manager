#!/usr/bin/env node

import { existsSync, writeFileSync } from 'fs';

// Create a simple SVG icon as fallback
function createFallbackIcon() {
  const svgIcon = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#grad)" rx="50"/>
    <text x="256" y="200" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle">OP</text>
    <text x="256" y="300" font-family="Arial, sans-serif" font-size="40" fill="white" text-anchor="middle">TCG</text>
  </svg>`;

  writeFileSync('resources/icon.svg', svgIcon);
  console.log('✓ Created fallback SVG icon');
}

// Create a simple PNG icon using a minimal valid PNG
function createSimplePNG() {
  // This is a minimal 1x1 blue pixel PNG file
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length (13 bytes)
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, // bit depth: 8
    0x02, // color type: RGB
    0x00, // compression: 0
    0x00, // filter: 0
    0x00, // interlace: 0
    0x37, 0x6E, 0xF9, 0x24, // IHDR CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length (12 bytes)
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data (1 blue pixel)
    0xE2, 0x21, 0xBC, 0x33, // IDAT CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length (0 bytes)
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ]);
  
  writeFileSync('resources/icon.png', pngData);
  console.log('✓ Created simple PNG icon');
}

function main() {
  console.log('🎨 Generating simple placeholder icons...');

  // Create fallback icons
  createFallbackIcon();
  createSimplePNG();

  console.log('✅ Simple icon generation complete!');
  console.log('💡 For better icons, install ImageMagick and run: npm run generate-icons');
}

main(); 