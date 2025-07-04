#!/usr/bin/env node

/**
 * Script to help with release process and update checking setup
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const packageJsonPath = join(process.cwd(), 'package.json')
const mainTsPath = join(process.cwd(), 'electron/main.ts')

function updateVersion(newVersion) {
  console.log(`Updating version to ${newVersion}...`)
  
  // Read current package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  
  // Update version
  packageJson.version = newVersion
  
  // Write back
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  
  console.log('✅ Version updated in package.json')
}

function updateGitHubConfig(githubUsername, repoName) {
  console.log(`Updating GitHub configuration for ${githubUsername}/${repoName}...`)
  
  // Read current package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  
  // Update publish configuration
  packageJson.build.publish.owner = githubUsername
  packageJson.build.publish.repo = repoName
  
  // Write back
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  
  // Update main.ts with correct URL
  let mainTsContent = readFileSync(mainTsPath, 'utf8')
  const newUrl = `https://github.com/${githubUsername}/${repoName}/releases/latest/download`
  mainTsContent = mainTsContent.replace(
    /const UPDATE_SERVER_URL = 'https:\/\/github\.com\/[^']+'/,
    `const UPDATE_SERVER_URL = '${newUrl}'`
  )
  writeFileSync(mainTsPath, mainTsContent)
  
  console.log('✅ GitHub configuration updated')
}

function createRelease() {
  console.log('Creating release...')
  
  try {
    // Build the application
    console.log('Building application...')
    execSync('npm run build:', { stdio: 'inherit' })
    
    // Create release
    console.log('Creating release...')
    execSync('npm run release', { stdio: 'inherit' })
    
    console.log('✅ Release created successfully!')
  } catch (error) {
    console.error('❌ Failed to create release:', error.message)
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
Update Release Script

Usage:
  node scripts/update-release.js <command> [options]

Commands:
  version <new-version>           Update version in package.json
  github <username> <repo>        Update GitHub configuration
  release                        Create a new release
  setup <username> <repo>         Setup GitHub configuration and create first release

Examples:
  node scripts/update-release.js version 1.1.0
  node scripts/update-release.js github myusername onepiece-tcg.online
  node scripts/update-release.js release
  node scripts/update-release.js setup myusername onepiece-tcg.online
`)
}

// Main execution
const command = process.argv[2]

switch (command) {
  case 'version':
    const newVersion = process.argv[3]
    if (!newVersion) {
      console.error('❌ Please provide a version number')
      process.exit(1)
    }
    updateVersion(newVersion)
    break
    
  case 'github':
    const username = process.argv[3]
    const repo = process.argv[4]
    if (!username || !repo) {
      console.error('❌ Please provide GitHub username and repository name')
      process.exit(1)
    }
    updateGitHubConfig(username, repo)
    break
    
  case 'release':
    createRelease()
    break
    
  case 'setup':
    const setupUsername = process.argv[3]
    const setupRepo = process.argv[4]
    if (!setupUsername || !setupRepo) {
      console.error('❌ Please provide GitHub username and repository name')
      process.exit(1)
    }
    updateGitHubConfig(setupUsername, setupRepo)
    createRelease()
    break
    
  default:
    showHelp()
    break
} 