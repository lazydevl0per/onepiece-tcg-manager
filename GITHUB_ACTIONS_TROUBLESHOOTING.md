# GitHub Actions Troubleshooting Guide

This guide helps you resolve common GitHub Actions build failures for the One Piece TCG Manager.

## 🔍 Common Issues and Solutions

### 1. Node.js Version Issues

**Problem:** Build fails due to Node.js version incompatibility.

**Solution:** Ensure you're using Node.js 18 or higher.

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 18
    cache: 'npm'
```

### 2. Dependencies Installation Failures

**Problem:** `npm ci` fails to install dependencies.

**Solutions:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and package-lock.json, then reinstall
- Check for network issues in GitHub Actions

### 3. Electron Builder Failures

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

### 4. Data Copy Issues

**Problem:** Card data not found during build.

**Solution:** Ensure the data copy script runs successfully:

```yaml
- name: Copy card data
  run: node scripts/copy-data.js
```

**Manual fix:**
```bash
# Run data copy script locally
node scripts/copy-data.js

# Check if data directory exists
ls -la data/english/
```

### 5. Artifact Upload Failures

**Problem:** Build artifacts are not uploaded or found.

**Solution:** The workflow includes better artifact checking:

```yaml
- name: List release directory (Windows)
  shell: powershell
  run: |
    echo "Release directory contents:"
    if (Test-Path "release/") {
      Get-ChildItem -Path "release/" -Force
    } else {
      echo "Release directory not found"
    }
    $executables = Get-ChildItem -Recurse -Include "*.exe", "*.dmg", "*.AppImage", "*.deb" -ErrorAction SilentlyContinue
    if ($executables) {
      $executables | ForEach-Object { $_.FullName }
    } else {
      echo "No executables found"
    }
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
- Missing system dependencies

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

CI workflow runs on multiple platforms:

```yaml
strategy:
  matrix:
    os: [windows-latest, ubuntu-latest]
```

### 3. Conditional Steps

Some steps only run when needed:

```yaml
- name: Build application
  run: npm run build
  continue-on-error: false
```

## 🚨 Emergency Fixes

### If All Builds Are Failing

1. **Check the latest commit** - Ensure it builds locally
2. **Review recent changes** - Look for breaking changes
3. **Test with a simple workflow** - Create a minimal test workflow
4. **Check GitHub status** - Ensure GitHub Actions is operational

### Quick Recovery Steps

```bash
# 1. Test build locally
npm run test-build

# 2. Check for obvious issues
npm run lint

# 3. Verify data is available
node scripts/copy-data.js

# 4. Try minimal build
npm run build
```

### If Release Workflow Fails

1. **Check tag format** - Ensure tags follow `v*` pattern
2. **Verify permissions** - Check repository permissions
3. **Review release step** - Ensure artifacts are found
4. **Manual release** - Use `npm run deploy` as backup

## 📊 Current Workflow Structure

### CI Workflow (`.github/workflows/ci.yml`)
- Runs on push to main/develop and pull requests
- Tests builds on Windows and Linux
- Runs linting and build verification
- Tests Electron build without publishing

### Release Workflow (`.github/workflows/build.yml`)
- Triggers on version tags (v*)
- Builds for Windows only (for faster releases)
- Creates GitHub releases with artifacts
- Uploads installers to release

## 🔍 Monitoring and Alerts

### Workflow Status
- Monitor workflow runs in GitHub Actions tab
- Set up notifications for failed builds
- Review performance metrics

### Common Failure Points
1. **Dependency installation** - Network issues, version conflicts
2. **Data copying** - Missing data files, script errors
3. **Build process** - Memory issues, platform-specific problems
4. **Artifact creation** - Missing files, permission issues
5. **Release creation** - Tag format, GitHub API issues

## 🛡️ Prevention Strategies

### Before Pushing
1. **Test locally** - Always test builds locally first
2. **Check dependencies** - Ensure all dependencies are committed
3. **Verify data** - Ensure card data is available
4. **Review changes** - Check for breaking changes

### Workflow Maintenance
1. **Update dependencies** - Keep Node.js and actions updated
2. **Monitor performance** - Track build times and failures
3. **Review logs** - Regularly check for patterns in failures
4. **Update documentation** - Keep troubleshooting guide current

## 📞 Getting Help

### Internal Resources
- [Build and Release Guide](BUILD_AND_RELEASE.md)
- [Quick Start Guide](QUICK_START.md)
- [Performance Optimizations](PERFORMANCE_OPTIMIZATIONS.md)

### External Resources
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Electron Builder Documentation](https://www.electron.build/)
- [Node.js Documentation](https://nodejs.org/docs/)

### Community Support
- Create an issue in the repository
- Check existing issues for similar problems
- Review GitHub Actions community discussions 