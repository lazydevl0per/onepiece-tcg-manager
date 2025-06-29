#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readdirSync, copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');
  
  const requiredFiles = [
    'package.json',
    'electron/main.ts',
    'src/main.tsx',
    'resources/icon.png'
  ];

  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      console.error(`❌ Required file not found: ${file}`);
      return false;
    }
  }

  console.log('✅ Prerequisites check passed');
  return true;
}

function buildForPlatform(platform) {
  console.log(`\n🔧 Building for ${platform}...`);
  
  try {
    switch (platform) {
      case 'win':
        execSync('npm run build:win', { stdio: 'inherit' });
        break;
      case 'mac':
        execSync('npm run build:mac', { stdio: 'inherit' });
        break;
      case 'linux':
        execSync('npm run build:linux', { stdio: 'inherit' });
        break;
      default:
        console.error(`❌ Unknown platform: ${platform}`);
        return false;
    }
    
    console.log(`✅ ${platform} build completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${platform} build failed:`, error.message);
    return false;
  }
}

function listArtifacts() {
  console.log('\n📦 Build artifacts:');
  
  const releaseDir = 'release';
  if (!existsSync(releaseDir)) {
    console.log('  No release directory found');
    return;
  }

  const items = readdirSync(releaseDir, { withFileTypes: true });
  
  for (const item of items) {
    if (item.isDirectory()) {
      console.log(`  📁 ${item.name}/`);
      const subItems = readdirSync(join(releaseDir, item.name));
      subItems.forEach(subItem => {
        console.log(`    📄 ${subItem}`);
      });
    } else {
      console.log(`  📄 ${item.name}`);
    }
  }
}

function createDeploymentPackage() {
  console.log('\n📦 Creating deployment package...');
  
  const deployDir = 'deployment';
  if (!existsSync(deployDir)) {
    mkdirSync(deployDir);
  }

  const releaseDir = 'release';
  if (!existsSync(releaseDir)) {
    console.error('❌ Release directory not found');
    return false;
  }

  try {
    // Copy all release artifacts to deployment directory
    execSync(`cp -r ${releaseDir}/* ${deployDir}/`);
    console.log('✅ Deployment package created');
    return true;
  } catch (error) {
    console.error('❌ Failed to create deployment package:', error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const platforms = args.length > 0 ? args : ['win', 'mac', 'linux'];
  
  console.log('🚀 One Piece TCG Manager Deployment\n');
  console.log(`📋 Target platforms: ${platforms.join(', ')}\n`);

  if (!checkPrerequisites()) {
    process.exit(1);
  }

  let allBuildsSuccessful = true;
  
  for (const platform of platforms) {
    if (!buildForPlatform(platform)) {
      allBuildsSuccessful = false;
    }
  }

  if (allBuildsSuccessful) {
    listArtifacts();
    createDeploymentPackage();
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📁 Files are ready in the "release" directory');
    console.log('📦 Deployment package created in "deployment" directory');
    console.log('\n🚀 Ready to upload to GitHub Releases or other platforms');
  } else {
    console.log('\n💥 Some builds failed. Please check the errors above.');
    process.exit(1);
  }
}

main(); 