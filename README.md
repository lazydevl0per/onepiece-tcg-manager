# One Piece TCG Manager

A modern desktop application for managing your One Piece Trading Card Game collection and building decks.
![image](https://github.com/user-attachments/assets/cdb5bd23-fa50-4314-b44f-e4e35b25f513)

## Features

- **Collection Management**: Add, view, and organize your One Piece TCG cards
- **Advanced Filtering**: Filter cards by color, type, rarity, and search by name or effect
- **Deck Builder**: Create and manage multiple decks with up to 50 cards
- **Deck Statistics**: View detailed statistics including cost analysis and color breakdown
- **Deck Import/Export**: Share decks with other players via JSON files
- **Real-time Search**: Instant search functionality across your collection
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Desktop App**: Native desktop application built with Electron
- **Performance Optimized**: Lazy loading and code splitting for fast startup

## Tech Stack

- **React 19** with TypeScript
- **Electron** for cross-platform desktop app
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
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

3. Start the development server:
```bash
# For web development (browser)
npm run dev

# For Electron development (desktop app)
npm run electron-dev
```

4. Build for production:
```bash
# Build web version
npm run build

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

## Project Structure

```
onepiece-tcg-online/
├── electron/
│   ├── main.ts              # Main Electron process
│   └── preload/
│       ├── index.ts         # Preload script
│       └── types.d.ts       # Type definitions
├── src/
│   ├── main.tsx             # Application entry point
│   ├── OnePieceTCGApp.tsx   # Main React component
│   ├── services/
│   │   └── cardDataService.ts # Card data management
│   ├── utils/
│   │   └── constants.ts     # Application constants
│   └── index.css            # Global styles with Tailwind
├── data/
│   ├── cards/en/            # Card data by set
│   ├── sets/en/             # Set information
│   └── README.md            # Data documentation
├── resources/
│   └── icon.png             # App icon
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── COLOR_PALETTE.md        # Design system documentation
└── README.md              # This file
```

## Features in Detail

### Collection Management
- Add custom cards with full details (name, cost, power, effect, etc.)
- View cards in a responsive grid layout with smooth image loading
- Filter by multiple criteria simultaneously
- Track how many copies of each card you own
- Collection statistics and progress tracking

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

## Performance Optimizations

- **Code Splitting**: Card data is split into separate chunks for faster loading
- **Lazy Loading**: Card data is loaded on-demand to reduce initial bundle size
- **Image Optimization**: Progressive image loading with fallback handling
- **Caching**: Metadata is cached for faster subsequent loads
- **Bundle Optimization**: Vendor libraries are separated for better caching

## Building for Distribution

To create distributable packages:

```bash
npm run dist
```

This will create platform-specific installers in the `release` directory:
- Windows: NSIS installer
- macOS: DMG file
- Linux: AppImage

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

## License

This project is open source and available under the [MIT License](LICENSE). 
