# One Piece TCG Manager

A modern desktop application for managing your One Piece Trading Card Game collection and building decks.

![image](https://github.com/user-attachments/assets/fad69a31-fae1-4931-a56c-d20399a5e2fe)

## Features

- **Collection Management**: Add, view, and organize your One Piece TCG cards
- **Deck Builder**: Create and manage multiple decks with up to 50 cards
- **Advanced Filtering**: Filter cards by color, type, rarity, set, and search by name
- **Deck Statistics**: View detailed statistics including cost analysis and color breakdown
- **Deck Import/Export**: Share decks with other players via JSON files
- **Desktop App**: Native desktop application built with Electron
- **Offline Support**: Works completely offline with local data storage (after online download of carddata)

## Quick Start

### Prerequisites
- Node.js (version 18 or higher)

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

3. Build
```bash
# Build for windows only currently
npm run build
```

3. Start development:
```bash
# For web development
npm run dev

# For Electron development
npm run electron-dev
```

### Build for Distribution
```bash
# Build for windows only currently
npm run dist
```

## Tech Stack

- **React 19** with TypeScript
- **Electron 37** for cross-platform desktop app
- **Vite 6** for fast development and building
- **Tailwind CSS 4** for styling

## Available Scripts

- `npm run dev` - Start development server (web)
- `npm run electron-dev` - Start Electron development
- `npm run build` - Build for production (web)
- `npm run dist` - Build Electron app for distribution
- `npm run lint` - Run ESLint

## Documentation

- [Quick Start Guide](QUICK_START.md)
- [Build and Release Guide](BUILD_AND_RELEASE.md)
- [Performance Optimizations](PERFORMANCE_OPTIMIZATIONS.md)

## License

This project is open source and available under the [MIT License](LICENSE). 
