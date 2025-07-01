# One Piece TCG Manager

A modern desktop application for managing your One Piece Trading Card Game collection and building decks.

![image](https://github.com/user-attachments/assets/12029acb-feba-41a7-bc37-6afe6f3f36b3)

## Features

- **Collection Management**: Add, view, and organize your One Piece TCG cards
- **Advanced Filtering**: Filter cards by color, type, rarity, set, and search by name or effect
- **Deck Builder**: Create and manage multiple decks with up to 50 cards
- **Deck Statistics**: View detailed statistics including cost analysis and color breakdown
- **Deck Import/Export**: Share decks with other players via JSON files
- **Real-time Search**: Instant search functionality across your collection
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Desktop App**: Native desktop application built with Electron
- **Performance Optimized**: Lazy loading and code splitting for fast startup
- **Offline Support**: Works completely offline with local data storage

## Tech Stack

- **React 19** with TypeScript
- **Electron 37** for cross-platform desktop app
- **Vite 6** for fast development and building
- **Tailwind CSS 4** for styling
- **Lucide React** for icons
- **Electron Builder** for packaging and distribution

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd onepiece-tcg-manager
```

2. Install dependencies:
```bash
npm install
```

3. Build for files:
```bash
npm run build
```

4. Start the development server:
```bash
# For web development (browser)
npm run dev

# For Electron development (desktop app)
npm run electron
```



# Build Electron app
npm run dist
```

### Available Scripts

- `npm run dev` - Start development server (web)
- `npm run electron-dev` - Start Electron development
- `npm run build` - Build for production (web)
- `npm run dist` - Build Electron app for distribution
- `npm run preview` - Preview production build (web)
- `npm run lint` - Run ESLint
- `npm run build:win` - Build for Windows
- `npm run build:mac` - Build for macOS
- `npm run build:linux` - Build for Linux
- `npm run build:all` - Build for all platforms
- `npm run release` - Build and publish release
- `npm run release:prepare` - Prepare release (update version and create tag)
- `npm run test-build` - Test build process
- `npm run deploy` - Deploy to hosting platform

## Project Structure

```
onepiece-tcg.online/
├── electron/
│   ├── main.ts              # Main Electron process
│   └── preload/
│       ├── index.ts         # Preload script
│       └── types.d.ts       # Type definitions
├── src/
│   ├── main.tsx             # Application entry point
│   ├── OnePieceTCGApp.tsx   # Main React component
│   ├── components/
│   │   ├── AppShell.tsx     # Main app shell component
│   │   ├── Card.tsx         # Card display component
│   │   ├── CollectionTab.tsx # Collection management tab
│   │   ├── DeckBuilderTab.tsx # Deck builder tab
│   │   ├── ManageCollectionModal.tsx # Collection management modal
│   │   ├── SearchAndFilters.tsx # Search and filter components
│   │   └── VirtualizedGrid.tsx # Optimized card grid
│   ├── hooks/
│   │   ├── useCollection.ts # Collection management hook
│   │   ├── useDeckBuilder.ts # Deck builder hook
│   │   └── useResizeOptimization.ts # Performance optimization hook
│   ├── services/
│   │   └── cardDataService.ts # Card data management
│   ├── utils/
│   │   ├── constants.ts     # Application constants
│   │   └── performance.ts   # Performance utilities
│   └── index.css            # Global styles with Tailwind
├── data/
│   └── data/
│       └── english/
│           ├── images/      # Card images by set
│           └── json/        # Card data files by set
├── scripts/
│   ├── copy-data.js         # Data copying script
│   ├── deploy.js            # Deployment script
│   ├── release.js           # Release preparation script
│   └── test-build.js        # Build testing script
├── resources/
│   ├── icon.png             # App icon
│   ├── icon.svg             # SVG icon
│   └── Crountch-One-Piece-Jolly-Roger-Luffys-flag-2.256.png # Jolly Roger
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── eslint.config.js        # ESLint configuration
├── postcss.config.js       # PostCSS configuration
├── COLOR_PALETTE.md        # Design system documentation
├── BUILD_AND_RELEASE.md    # Build and release guide
├── PERFORMANCE_OPTIMIZATIONS.md # Performance documentation
├── QUICK_START.md          # Quick start guide
└── README.md              # This file
```

## Features in Detail

### Collection Management
- Add custom cards with full details (name, cost, power, effect, etc.)
- View cards in a responsive grid layout with smooth image loading
- Filter by multiple criteria simultaneously (color, type, rarity, set)
- Track how many copies of each card you own
- Collection statistics and progress tracking
- Show/hide owned cards only

### Deck Builder
- Create multiple decks with custom names
- Add cards from your collection to decks with quantity controls
- Remove cards from decks or adjust quantities
- View comprehensive deck statistics including:
  - Total cards and deck size
  - Average cost analysis
  - Card type breakdown (Characters, Events, Stages)
  - Color distribution
- Support for up to 50 cards per deck (standard TCG limit)
- Maximum 4 copies per card (standard TCG rule)
- One leader card per deck

### Deck Import/Export
- Export decks as JSON files for sharing
- Import decks from JSON files
- Preserve deck metadata and card quantities

### Card Information
Each card includes:
- Name and set information
- Cost, power, and counter values
- Color and rarity indicators
- Full effect text
- Card type (Leader, Character, Event, Stage)
- High-quality card images with fallback handling

### Desktop Features
- Native desktop application
- Cross-platform support (Windows, macOS, Linux)
- Offline functionality
- Native window controls
- Optimized performance with lazy loading
- Automatic updates via GitHub releases

## Performance Optimizations

- **Code Splitting**: Card data is split into separate chunks for faster loading
- **Lazy Loading**: Card data is loaded on-demand to reduce initial bundle size
- **Image Optimization**: Progressive image loading with fallback handling
- **Caching**: Metadata is cached for faster subsequent loads
- **Bundle Optimization**: Vendor libraries are separated for better caching
- **Virtualized Grid**: Efficient rendering of large card collections
- **Resize Optimization**: Throttled window resize handling

## Building for Distribution

To create distributable packages:

```bash
# Build for all platforms
npm run build:all

# Build for specific platform
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

This will create platform-specific installers in the `release` directory:
- **Windows**: NSIS installer and portable executable
- **macOS**: DMG file and ZIP archive
- **Linux**: AppImage and DEB package

## Automated Releases

The project includes GitHub Actions workflows for automated builds and releases:

1. **CI Workflow**: Runs on every push and pull request
2. **Release Workflow**: Triggers on version tags for automated releases

To create a release:
```bash
# Prepare release (updates version and creates git tag)
npm run release:prepare 1.0.0

# Push changes to trigger automated build
git push origin main --tags
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines

- Follow the existing code style and TypeScript patterns
- Use the established color palette from `COLOR_PALETTE.md`
- Ensure all new features work in both web and Electron environments
- Test performance with large card collections
- Update documentation for new features
- Follow the performance optimization guidelines in `PERFORMANCE_OPTIMIZATIONS.md`

## Documentation

- [Quick Start Guide](QUICK_START.md) - Get up and running quickly
- [Build and Release Guide](BUILD_AND_RELEASE.md) - Detailed build instructions
- [Performance Optimizations](PERFORMANCE_OPTIMIZATIONS.md) - Performance best practices
- [Color Palette](COLOR_PALETTE.md) - Design system and color guidelines

## License

This project is open source and available under the [MIT License](LICENSE). 
