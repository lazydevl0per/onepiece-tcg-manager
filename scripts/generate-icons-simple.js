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

// Create a simple text-based icon for platforms that need it
function createTextIcon() {
  const textIcon = `# One Piece TCG Manager Icon
# This is a placeholder icon file
# Replace with actual icon.png for better appearance`;

  writeFileSync('resources/icon.txt', textIcon);
  console.log('✓ Created placeholder text icon');
}

function main() {
  console.log('🎨 Generating simple placeholder icons...');

  // Create fallback icons
  createFallbackIcon();
  createTextIcon();

  console.log('✅ Simple icon generation complete!');
  console.log('💡 For better icons, install ImageMagick and run: npm run generate-icons');
}

main(); 