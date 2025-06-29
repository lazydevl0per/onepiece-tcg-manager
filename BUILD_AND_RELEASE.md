# Build and Release Guide

This guide explains how to build and release the One Piece TCG Manager application for different platforms.

## Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Git** (for version control)
- **ImageMagick** (for icon generation)

### Installing ImageMagick
- **Windows**: Download from [ImageMagick website](https://imagemagick.org/script/download.php#windows)
- **macOS**: `brew install imagemagick`
- **Linux**: `sudo apt-get install imagemagick`

## Local Development

### Setup
```bash
# Install dependencies
npm install

# Generate icons (requires ImageMagick)
npm run generate-icons

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

2. **Release Workflow** (`.github/workflows/build.yml`)
   - Triggers on version tags (v*)
   - Builds for Windows, macOS, and Linux
   - Creates GitHub releases with artifacts

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

## Troubleshooting

### Common Issues

#### Icon Generation Fails
- Ensure ImageMagick is installed and accessible
- Check that `resources/icon.png` exists
- On macOS, ensure `iconutil` is available

#### Build Fails on macOS
- Ensure you have Xcode Command Line Tools installed
- Run `xcode-select --install` if needed

#### Build Fails on Windows
- Ensure you have Visual Studio Build Tools installed
- Install Windows 10 SDK

#### GitHub Actions Fail
- Check that the repository has the required secrets
- Ensure the workflow files are in the correct location
- Verify that the GitHub token has the necessary permissions

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
- Automated releases are created on GitHub
- Assets are automatically uploaded
- Release notes are generated from commits

### Manual Distribution
- Built artifacts are in the `release/` directory
- Upload to your preferred distribution platform
- Consider code signing for better user experience

## Code Signing (Optional)

For production releases, consider code signing:

### Windows
- Purchase a code signing certificate
- Configure in electron-builder settings
- Sign during build process

### macOS
- Join Apple Developer Program
- Configure code signing certificates
- Enable notarization

### Linux
- GPG signing for packages
- Configure in electron-builder settings

## Security Considerations

- Never commit sensitive information (API keys, certificates)
- Use GitHub Secrets for sensitive data
- Regularly update dependencies
- Consider security scanning in CI/CD pipeline

## Performance Optimization

### Build Optimization
- Use `npm ci` instead of `npm install` in CI
- Enable caching in GitHub Actions
- Optimize bundle size with code splitting

### Runtime Optimization
- Enable compression in production builds
- Optimize images and assets
- Use efficient data loading strategies

## Support

For issues with the build process:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Test builds locally
4. Create an issue in the repository

## Contributing

When contributing to the build system:
1. Test builds on your target platform
2. Update documentation if needed
3. Ensure CI/CD pipeline passes
4. Follow semantic versioning for releases 