# GitHub Actions Troubleshooting Guide

This guide helps you resolve common GitHub Actions build failures for the One Piece TCG Manager.

## 🔍 Common Issues and Solutions

### 1. Icon Generation Failures

**Problem:** Build fails because ImageMagick is not available or icon generation fails.

**Solution:** The workflow now uses a simple icon generation that doesn't require ImageMagick.

```yaml
# The workflow now runs:
- name: Generate simple icons
  run: npm run generate-icons-simple

- name: Try to generate full icons (optional)
  run: npm run generate-icons
  continue-on-error: true
```

### 2. Node.js Version Issues

**Problem:** Build fails due to Node.js version incompatibility.

**Solution:** Ensure you're using Node.js 18 or higher.

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 18
    cache: 'npm'
```

### 3. Dependencies Installation Failures

**Problem:** `npm ci` fails to install dependencies.

**Solutions:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and package-lock.json, then reinstall
- Check for network issues in GitHub Actions

### 4. Electron Builder Failures

**Problem:** Electron app build fails.

**Common causes:**
- Missing icon files
- Platform-specific build tools not available
- Memory issues during build

**Solutions:**
```bash
# Check if icons exist
ls -la resources/

# Try building without publishing
npm run dist

# Check available memory
free -h
```

### 5. Artifact Upload Failures

**Problem:** Build artifacts are not uploaded or found.

**Solution:** The workflow now includes better artifact checking:

```yaml
- name: List release directory
  run: |
    echo "Release directory contents:"
    ls -la release/ || echo "Release directory not found"
    find . -name "*.exe" -o -name "*.dmg" -o -name "*.AppImage" -o -name "*.deb" || echo "No executables found"

- name: Upload artifacts
  uses: actions/upload-artifact@v4
  with:
    name: one-piece-tcg-manager-${{ matrix.os }}
    path: release/
    if-no-files-found: error
```

## 🛠️ Debugging Steps

### 1. Check Workflow Logs

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Select the failed workflow run
4. Click on the failed job
5. Review the step-by-step logs

### 2. Enable Debug Logging

Add this to your workflow to get more verbose output:

```yaml
- name: Build with debug
  run: |
    DEBUG=electron-builder npm run dist
  env:
    DEBUG: electron-builder
```

### 3. Test Locally

Before pushing to GitHub, test the build locally:

```bash
# Install dependencies
npm install

# Generate icons
npm run generate-icons-simple

# Test build
npm run test-build

# Build for specific platform
npm run build:win  # or mac, linux
```

## 🔧 Platform-Specific Issues

### Windows Build Issues

**Common problems:**
- Missing Visual Studio Build Tools
- Windows SDK not installed
- Path issues with long filenames

**Solutions:**
```yaml
# In workflow, ensure Windows build tools are available
- name: Setup Windows Build Tools
  run: |
    # Windows runners come with build tools pre-installed
    echo "Build tools should be available"
```

### macOS Build Issues

**Common problems:**
- Xcode Command Line Tools missing
- Code signing issues
- Icon generation failures

**Solutions:**
```yaml
- name: Install Xcode Command Line Tools
  run: |
    xcode-select --install || true
```

### Linux Build Issues

**Common problems:**
- Missing system dependencies
- AppImage creation failures
- Permission issues

**Solutions:**
```yaml
- name: Install Linux dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y fuse
```

## 📋 Workflow Optimization

### 1. Caching

The workflow uses npm caching to speed up builds:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

### 2. Matrix Strategy

Builds run on multiple platforms simultaneously:

```yaml
strategy:
  matrix:
    os: [windows-latest, macos-latest, ubuntu-latest]
    node-version: [18]
```

### 3. Conditional Steps

Some steps only run when needed:

```yaml
- name: Try to generate full icons (optional)
  run: npm run generate-icons
  continue-on-error: true
```

## 🚨 Emergency Fixes

### If All Builds Are Failing

1. **Check the latest commit** - Ensure it builds locally
2. **Review recent changes** - Look for breaking changes
3. **Test with a simple workflow** - Create a minimal test workflow
4. **Check GitHub status** - Ensure GitHub Actions is operational

### Quick Recovery Steps

```bash
# 1. Revert to a working commit
git revert HEAD

# 2. Push the revert
git push origin main

# 3. Test locally first
npm run test-build

# 4. Create a new release
npm run release:prepare 1.0.1
git push origin main --tags
```

## 📞 Getting Help

### 1. Check Existing Issues
- Look for similar issues in the repository
- Check GitHub Actions documentation

### 2. Create a Detailed Issue
When reporting an issue, include:
- Workflow run URL
- Error logs
- Steps to reproduce
- Expected vs actual behavior

### 3. Debug Information
Include these details:
```bash
# System information
node --version
npm --version
git --version

# Build output
npm run test-build

# Workflow environment
echo $GITHUB_REF
echo $GITHUB_SHA
```

## 🔄 Workflow Maintenance

### Regular Checks
- Monitor build times
- Review dependency updates
- Check for deprecated actions
- Update Node.js versions when needed

### Performance Optimization
- Use caching effectively
- Minimize build steps
- Use conditional steps
- Optimize artifact sizes

---

**Remember:** Most build failures can be resolved by testing locally first and ensuring all dependencies are properly configured. 