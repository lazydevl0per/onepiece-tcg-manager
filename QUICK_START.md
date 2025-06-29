# Quick Start Guide

Get your One Piece TCG Manager application built and deployed quickly!

## 🚀 Immediate Build (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Test Build Locally
```bash
npm run test-build
```

### 3. Build for Your Platform
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# All platforms
npm run build:all
```

## 📦 Create a Release

### Automated Release (Recommended)
```bash
# Prepare release (updates version and creates git tag)
npm run release:prepare 1.0.0

# Push to trigger GitHub Actions
git push origin main --tags
```

### Manual Release
```bash
# Build and create release artifacts
npm run deploy

# Check the "release" directory for your files
ls release/
```

## 🎯 What You Get

### Windows
- `One Piece TCG Manager Setup.exe` - Installer
- `One Piece TCG Manager.exe` - Portable app

### macOS
- `One Piece TCG Manager.dmg` - Disk image
- `One Piece TCG Manager.zip` - Archive

### Linux
- `One Piece TCG Manager.AppImage` - AppImage
- `One Piece TCG Manager.deb` - Debian package

## 🔧 Troubleshooting

### Common Issues

**Build fails:**
```bash
# Clean and retry
rm -rf node_modules package-lock.json
npm install
npm run test-build
```

**GitHub Actions not working:**
- Ensure workflow files are in `.github/workflows/`
- Check repository permissions
- Verify GitHub token has release permissions

## 📋 Next Steps

1. **Test your build** - Run the generated executable
2. **Upload to GitHub** - Create a release with your artifacts
3. **Distribute** - Share the download links with users
4. **Update** - Use semantic versioning for future releases

## 🆘 Need Help?

- Check the full [Build and Release Guide](BUILD_AND_RELEASE.md)
- Review [GitHub Actions logs](https://github.com/your-username/onepiece-tcg.online/actions)
- Create an issue in the repository

---

**Happy building! 🎉** 