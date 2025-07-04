# Update Checking Feature

The One Piece TCG Manager now includes automatic update checking functionality that allows users to receive updates seamlessly.

## Features

- **Automatic Update Checking**: The app checks for updates every 4 hours automatically
- **Manual Update Check**: Users can manually check for updates using the UI
- **Visual Status Indicators**: Clear icons and status messages show update availability
- **One-Click Installation**: Updates can be installed with a single click
- **Development Mode Detection**: Update checking is disabled in development mode

## How It Works

### Automatic Updates
- The app automatically checks for updates when it starts
- Updates are checked every 4 hours in the background
- When an update is available, users are notified via a dialog
- Updates are downloaded automatically in the background
- Users are prompted to restart the app when the update is ready

### Manual Updates
- Users can click the "Check" button in the sidebar to manually check for updates
- The update status is displayed with appropriate icons:
  - ✅ Up to date
  - 🔄 Checking for updates
  - ⚠️ Update available
  - 📥 Update ready to install
  - ❌ Update check failed

## Setup Instructions

### 1. Configure GitHub Repository

Update the GitHub configuration in your `package.json`:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-github-username",
      "repo": "your-repo-name",
      "releaseType": "release"
    }
  }
}
```

### 2. Update the Update Server URL

In `electron/main.ts`, update the `UPDATE_SERVER_URL` constant:

```typescript
const UPDATE_SERVER_URL = 'https://github.com/your-github-username/your-repo-name/releases/latest/download'
```

### 3. Using the Update Scripts

The project includes convenient scripts for managing updates:

```bash
# Update version number
npm run update:version 1.1.0

# Configure GitHub repository
npm run update:github your-username your-repo

# Create a new release
npm run update:release

# Setup everything at once
npm run update:setup your-username your-repo
```

## Release Process

1. **Update Version**: Increment the version number in `package.json`
2. **Build**: The app is built for distribution
3. **Release**: A new GitHub release is created with the built files
4. **Distribution**: Users automatically receive the update notification

## Technical Details

### Main Process (electron/main.ts)
- Uses Electron's `autoUpdater` module
- Handles update checking, downloading, and installation
- Manages update status tracking
- Provides IPC handlers for renderer communication

### Preload Script (electron/preload/index.ts)
- Exposes update checking APIs to the renderer
- Handles communication between main and renderer processes

### Renderer Process (src/components/UpdateChecker.tsx)
- React component for update UI
- Displays update status and provides user controls
- Integrates with the main process via preload APIs

### Type Definitions (electron/preload/types.d.ts)
- TypeScript definitions for update checking APIs
- Ensures type safety across the application

## Configuration Options

### Update Check Interval
The automatic update check interval can be modified in `electron/main.ts`:

```typescript
// Check for updates every 4 hours (default)
setInterval(() => {
  autoUpdater.checkForUpdates()
}, 4 * 60 * 60 * 1000)
```

### Update Server URL
The update server URL can be customized for different distribution methods:

```typescript
// GitHub releases (default)
const UPDATE_SERVER_URL = 'https://github.com/username/repo/releases/latest/download'

// Custom server
const UPDATE_SERVER_URL = 'https://your-server.com/updates'
```

## Troubleshooting

### Update Check Fails
- Verify the GitHub repository configuration
- Check that releases are properly tagged
- Ensure the update server URL is correct
- Check network connectivity

### Update Not Installing
- Verify the app has write permissions
- Check that the update was downloaded successfully
- Ensure the app can restart properly

### Development Mode
- Update checking is automatically disabled in development mode
- The UpdateChecker component won't display in dev builds
- Use production builds to test update functionality

## Security Considerations

- Updates are downloaded from trusted sources only
- The app verifies update integrity before installation
- Update URLs are restricted to configured domains
- Development mode prevents accidental update checks

## Future Enhancements

- Progress indicators for download progress
- Changelog display for updates
- Rollback functionality for failed updates
- Custom update channels (beta, stable, etc.)
- Delta updates for smaller download sizes 