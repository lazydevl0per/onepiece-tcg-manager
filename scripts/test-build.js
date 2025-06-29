#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

function runCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function checkArtifacts() {
  console.log('\n📁 Checking build artifacts...');
  
  const releaseDir = 'release';
  if (!existsSync(releaseDir)) {
    console.error('❌ Release directory not found');
    return false;
  }

  const files = readdirSync(releaseDir, { recursive: true });
  console.log('✅ Build artifacts found:');
  files.forEach(file => {
    if (typeof file === 'string' && !file.includes('node_modules')) {
      console.log(`  📄 ${file}`);
    }
  });

  return true;
}

function main() {
  console.log('🚀 Starting One Piece TCG Manager build test...\n');

  const steps = [
    {
      command: 'npm install',
      description: 'Installing dependencies'
    },
    {
      command: 'npm run build',
      description: 'Building web application'
    },
    {
      command: 'npm run dist',
      description: 'Building Electron application'
    }
  ];

  let allPassed = true;
  
  for (const step of steps) {
    if (!runCommand(step.command, step.description)) {
      allPassed = false;
      break;
    }
  }

  if (allPassed) {
    checkArtifacts();
    console.log('\n🎉 Build test completed successfully!');
    console.log('\n📦 Your application is ready for distribution.');
    console.log('📁 Check the "release" directory for build artifacts.');
  } else {
    console.log('\n💥 Build test failed. Please check the errors above.');
    process.exit(1);
  }
}

main(); 