// Color mapping for One Piece TCG colors to CSS classes
export const colorMap: Record<string, string> = {
  'Red': 'bg-red-500',
  'Blue': 'bg-blue-500',
  'Green': 'bg-green-500',
  'Yellow': 'bg-yellow-500',
  'Purple': 'bg-purple-500',
  'Black': 'bg-gray-900',
  'Colorless': 'bg-gray-400',
  'Red/Green': 'bg-gradient-to-r from-red-500 to-green-500',
  'Red/Blue': 'bg-gradient-to-r from-red-500 to-blue-500',
  'Red/Yellow': 'bg-gradient-to-r from-red-500 to-yellow-500',
  'Blue/Green': 'bg-gradient-to-r from-blue-500 to-green-500',
  'Blue/Yellow': 'bg-gradient-to-r from-blue-500 to-yellow-500',
  'Green/Yellow': 'bg-gradient-to-r from-green-500 to-yellow-500',
  'Green/Purple': 'bg-gradient-to-r from-green-500 to-purple-500',
  'Yellow/Purple': 'bg-gradient-to-r from-yellow-500 to-purple-500',
  'Red/Blue/Green': 'bg-gradient-to-r from-red-500 via-blue-500 to-green-500',
  'Red/Blue/Yellow': 'bg-gradient-to-r from-red-500 via-blue-500 to-yellow-500',
  'Red/Green/Yellow': 'bg-gradient-to-r from-red-500 via-green-500 to-yellow-500',
  'Blue/Green/Yellow': 'bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500',
  'Red/Blue/Green/Yellow': 'bg-gradient-to-r from-red-500 via-blue-500 via-green-500 to-yellow-500'
};

// Rarity colors using modern palette
export const rarityColors: Record<string, string> = {
  'C': 'text-gray-400',
  'UC': 'text-blue-300',
  'R': 'text-blue-500',
  'SR': 'text-yellow-400',
  'SEC': 'text-yellow-600',
  'L': 'text-red-500',
  'P': 'text-yellow-500',
  'ST': 'text-yellow-400',
  'PR': 'text-yellow-500'
};

// Card type colors
export const typeColors: Record<string, string> = {
  'LEADER': 'bg-red-500/20 text-red-400 border-red-500/30',
  'CHARACTER': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'EVENT': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'STAGE': 'bg-gray-600/20 text-gray-300 border-gray-600/30'
};

// Utility functions for converting values to CSS classes
export const getCardColorClass = (color: string): string => {
  return colorMap[color] || 'bg-gray-400';
};

export const getRarityColorClass = (rarity: string): string => {
  return rarityColors[rarity] || 'text-gray-400';
};

export const getTypeColorClass = (type: string): string => {
  return typeColors[type] || 'bg-gray-600/20 text-gray-300 border-gray-600/30';
};

// Set abbreviations and full names
export const setNames: Record<string, string> = {
  'OP01': 'Romance Dawn',
  'OP02': 'Paramount War',
  'OP03': 'Pillars of Strength',
  'OP04': 'Kingdoms of Intrigue',
  'OP05': 'Awakening of the New Era',
  'OP06': 'Wings of the Captain',
  'OP07': 'Dawn of the New Era',
  'OP08': 'Adventure on the Grand Line',
  'OP09': 'The New Era',
  'EB01': 'Enhancement Collection',
  'ST13': 'Starter Deck 13',
  'ST14': 'Starter Deck 14',
  'ST15': 'Starter Deck 15',
  'ST16': 'Starter Deck 16',
  'ST17': 'Starter Deck 17',
  'ST18': 'Starter Deck 18',
  'ST19': 'Starter Deck 19',
  'ST20': 'Starter Deck 20',
  'PRB01': 'Promo Collection'
};

// Default filters
export const defaultFilters = {
  color: 'all',
  type: 'all',
  rarity: 'all',
  set: 'all'
};

// Deck building constants
export const DECK_SIZE_LIMIT = 50;
export const LEADER_LIMIT = 1;
export const MAX_COPIES_PER_CARD = 4; 