#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const packageJsonPath = 'package.json';

function updateVersion(newVersion) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✓ Updated version to ${newVersion}`);
}

function createGitTag(version) {
  try {
    execSync(`git add .`);
    execSync(`git commit -m "chore: bump version to ${version}"`);
    execSync(`git tag v${version}`);
    console.log(`✓ Created git tag v${version}`);
  } catch (error) {
    console.error('Failed to create git tag:', error.message);
  }
}

function pushToGit() {
  try {
    execSync('git push origin main --tags');
    console.log('✓ Pushed to git with tags');
  } catch (error) {
    console.error('Failed to push to git:', error.message);
  }
}

function main() {
  const args = process.argv.slice(2);
  const version = args[0];

  if (!version) {
    console.error('Usage: node scripts/release.js <version>');
    console.error('Example: node scripts/release.js 1.0.0');
    process.exit(1);
  }

  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.error('Version must be in semantic versioning format (e.g., 1.0.0)');
    process.exit(1);
  }

  console.log(`Creating release for version ${version}...`);

  try {
    updateVersion(version);
    createGitTag(version);
    
    console.log('\nRelease preparation complete!');
    console.log('\nNext steps:');
    console.log('1. Push the changes: git push origin main --tags');
    console.log('2. The GitHub Action will automatically build and create a release');
    console.log('3. Or run manually: npm run release');
    
    const shouldPush = args.includes('--push');
    if (shouldPush) {
      pushToGit();
    }
  } catch (error) {
    console.error('Release failed:', error.message);
    process.exit(1);
  }
}

main(); 