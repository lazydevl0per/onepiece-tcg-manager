# Build and Release Guide

This guide explains how to build and release the One Piece TCG Manager application for different platforms.

## Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Git** (for version control)

### Platform-Specific Requirements

#### Windows
- Visual Studio Build Tools (usually pre-installed on GitHub Actions runners)
- Windows 10 SDK

#### macOS
- Xcode Command Line Tools
- Code signing certificates (for distribution)

#### Linux
- Fuse (for AppImage creation)
- Build essentials

## Local Development

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Electron in development mode
npm run electron-dev
```

### Building Locally

#### Build for all platforms
```bash
npm run build:all
```

#### Build for specific platform
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

#### Build without publishing
```bash
npm run dist
```

## Automated Releases

### GitHub Actions Setup

The project includes GitHub Actions workflows for automated builds and releases:

1. **CI Workflow** (`.github/workflows/ci.yml`)
   - Runs on every push to main/develop and pull requests
   - Tests builds on Windows and Linux
   - Runs linting and build verification
   - Tests Electron build without publishing

2. **Release Workflow** (`.github/workflows/build.yml`)
   - Triggers on version tags (v*)
   - Builds for Windows (optimized for faster releases)
   - Creates GitHub releases with artifacts
   - Uploads installers to release

### Creating a Release

#### Method 1: Using the release script (Recommended)
```bash
# Prepare release (updates version and creates git tag)
npm run release:prepare 1.0.0

# Push changes to trigger automated build
git push origin main --tags
```

#### Method 2: Manual release
```bash
# Update version in package.json
# Create and push git tag
git tag v1.0.0
git push origin main --tags
```

#### Method 3: GitHub Actions manual trigger
1. Go to GitHub repository → Actions
2. Select "Build and Release" workflow
3. Click "Run workflow"
4. Enter version number
5. Click "Run workflow"

### Release Artifacts

The automated build creates the following artifacts:

#### Windows
- `One Piece TCG Manager Setup.exe` - NSIS installer
- `One Piece TCG Manager.exe` - Portable executable

#### macOS
- `One Piece TCG Manager.dmg` - Disk image installer
- `One Piece TCG Manager.zip` - Compressed archive

#### Linux
- `One Piece TCG Manager.AppImage` - AppImage package
- `One Piece TCG Manager.deb` - Debian package

## Configuration

### Electron Builder Configuration

The build configuration is in `package.json` under the `build` section:

```json
{
  "build": {
    "appId": "com.onepiece.tcg.manager",
    "productName": "One Piece TCG Manager",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "dist-electron/**/*",
      "node_modules/**/*",
      "resources/**/*"
    ],
    "extraResources": [
      {
        "from": "data",
        "to": "data",
        "filter": ["**/*"]
      }
    ]
  }
}
```

### Platform-Specific Settings

#### Windows
- **Targets**: NSIS installer and portable executable
- **Architecture**: x64
- **Icon**: `resources/icon.ico`

#### macOS
- **Targets**: DMG and ZIP
- **Architecture**: x64 and ARM64 (Apple Silicon)
- **Icon**: `resources/icon.icns`

#### Linux
- **Targets**: AppImage and DEB package
- **Architecture**: x64
- **Icon**: `resources/icon.png`

## Build Process

### 1. Data Preparation
```bash
# Copy card data to build directory
node scripts/copy-data.js
```

### 2. Application Build
```bash
# Build React application
npm run build
```

### 3. Electron Build
```bash
# Build Electron application
npm run dist
```

### 4. Artifact Creation
- Creates platform-specific installers
- Generates portable executables
- Packages all resources and dependencies

## Troubleshooting

### Common Issues

#### Build Fails on macOS
- Ensure you have Xcode Command Line Tools installed
- Run `xcode-select --install` if needed
- Check code signing certificates

#### Build Fails on Windows
- Ensure you have Visual Studio Build Tools installed
- Install Windows 10 SDK
- Check for long file path issues

#### GitHub Actions Fail
- Check that the repository has the required secrets
- Ensure the workflow files are in the correct location
- Verify that the GitHub token has the necessary permissions
- See [GitHub Actions Troubleshooting](GITHUB_ACTIONS_TROUBLESHOOTING.md)

#### Data Loading Issues
```bash
# Ensure data is copied correctly
node scripts/copy-data.js

# Check data directory structure
ls -la data/data/english/
```

### Debugging Builds

#### Enable Verbose Logging
```bash
# Set environment variable for verbose output
DEBUG=electron-builder npm run build:win
```

#### Check Build Artifacts
```bash
# List generated files
ls -la release/
```

#### Test Built Application
```bash
# On Windows
./release/win-unpacked/One\ Piece\ TCG\ Manager.exe

# On macOS
./release/mac/One\ Piece\ TCG\ Manager.app/Contents/MacOS/One\ Piece\ TCG\ Manager

# On Linux
./release/linux-unpacked/one-piece-tcg-manager
```

## Distribution

### GitHub Releases
- Automated releases via GitHub Actions
- Artifacts uploaded to GitHub releases
- Release notes generated automatically

### Manual Distribution
```bash
# Create release package
npm run deploy

# Upload artifacts manually to GitHub releases
# or distribute via other channels
```

### Release Notes
- Automatically generated from commits
- Include version information
- List of changes and improvements

## Performance Optimization

### Build Performance
- **Caching**: npm cache for faster dependency installation
- **Parallel builds**: Multiple platforms built simultaneously
- **Incremental builds**: Only rebuild changed components

### Application Performance
- **Code splitting**: Separate chunks for different features
- **Lazy loading**: Load data on-demand
- **Image optimization**: Compressed and optimized images
- **Bundle optimization**: Minimized and tree-shaken bundles

## Security Considerations

### Code Signing
- **Windows**: Code signing certificates for installers
- **macOS**: Developer certificates for app distribution
- **Linux**: GPG signing for packages

### Dependencies
- Regular security audits with `npm audit`
- Pinned dependency versions
- Automated vulnerability scanning

## Monitoring and Maintenance

### Build Monitoring
- Track build times and success rates
- Monitor artifact sizes
- Alert on build failures

### Dependency Updates
- Regular updates of Node.js and npm
- Security patches for dependencies
- Compatibility testing for major updates

### Performance Tracking
- Monitor application startup times
- Track memory usage patterns
- Measure user interaction performance

## Future Improvements

### Planned Enhancements
1. **Multi-platform builds**: Build for all platforms in single workflow
2. **Automated testing**: Integration tests for built applications
3. **Delta updates**: Incremental update system
4. **Auto-updater**: Built-in update mechanism
5. **Code signing automation**: Automated certificate management

### Infrastructure Improvements
1. **Build caching**: Persistent cache for faster builds
2. **Parallel processing**: Concurrent build steps
3. **Artifact optimization**: Smaller, more efficient packages
4. **Deployment automation**: Automated deployment to multiple channels 