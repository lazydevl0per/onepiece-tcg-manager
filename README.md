# One Piece TCG Manager

A modern desktop application for managing your One Piece Trading Card Game collection and building decks.

## Features

- **Collection Management**: Add, view, and organize your One Piece TCG cards
- **Advanced Filtering**: Filter cards by color, type, rarity, and search by name or effect
- **Deck Builder**: Create and manage multiple decks with up to 50 cards
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Real-time Search**: Instant search functionality across your collection
- **Desktop App**: Native desktop application built with Electron

## Tech Stack

- **React 18** with TypeScript
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
│   └── index.css            # Global styles with Tailwind
├── resources/
│   └── icon.png             # App icon
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md              # This file
```

## Features in Detail

### Collection Management
- Add custom cards with full details (name, cost, power, effect, etc.)
- View cards in a responsive grid layout
- Filter by multiple criteria simultaneously
- Track how many copies of each card you own

### Deck Builder
- Create multiple decks
- Add cards from your collection to decks
- Remove cards from decks
- View deck statistics (total cards, leader info)
- Support for up to 50 cards per deck (standard TCG limit)

### Card Information
Each card includes:
- Name and set information
- Cost, power, and counter values
- Color and rarity indicators
- Full effect text
- Card type (Leader, Character, Event, Stage)

### Desktop Features
- Native desktop application
- Cross-platform support (Windows, macOS, Linux)
- Offline functionality
- Native window controls
- System tray integration (future)

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

## License

This project is open source and available under the [MIT License](LICENSE). 