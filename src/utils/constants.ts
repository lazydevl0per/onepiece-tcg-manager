// Color mapping for One Piece TCG colors to CSS classes using One Piece theme colors
export const colorMap: Record<string, string> = {
  'Red': 'bg-[var(--op-straw-hat-red)]',
  'Blue': 'bg-[var(--op-ocean-blue)]',
  'Green': 'bg-[var(--op-forest-green)]',
  'Yellow': 'bg-[var(--op-sunny-yellow)]',
  'Purple': 'bg-[var(--op-purple-royal)]',
  'Black': 'bg-[var(--op-neutral-black)]',
  'Colorless': 'bg-[var(--op-neutral-silver)]',
  'Red/Green': 'bg-gradient-to-r from-red-600 from-50% to-green-600 to-50% shadow-lg',
  'Red/Blue': 'bg-gradient-to-r from-red-600 from-50% to-blue-600 to-50% shadow-lg',
  'Red/Yellow': 'bg-gradient-to-r from-red-600 from-50% to-yellow-500 to-50% shadow-lg',
  'Blue/Green': 'bg-gradient-to-r from-blue-600 from-50% to-green-600 to-50% shadow-lg',
  'Blue/Yellow': 'bg-gradient-to-r from-blue-600 from-50% to-yellow-500 to-50% shadow-lg',
  'Green/Yellow': 'bg-gradient-to-r from-green-600 from-50% to-yellow-500 to-50% shadow-lg',
  'Green/Purple': 'bg-gradient-to-r from-green-600 from-50% to-purple-600 to-50% shadow-lg',
  'Yellow/Purple': 'bg-gradient-to-r from-yellow-500 from-50% to-purple-600 to-50% shadow-lg',
  'Red/Blue/Green': 'bg-gradient-to-r from-red-600 from-0% via-blue-600 via-50% to-green-600 to-100% shadow-lg',
  'Red/Blue/Yellow': 'bg-gradient-to-r from-red-600 from-0% via-blue-600 via-50% to-yellow-500 to-100% shadow-lg',
  'Red/Green/Yellow': 'bg-gradient-to-r from-red-600 from-0% via-green-600 via-50% to-yellow-500 to-100% shadow-lg',
  'Blue/Green/Yellow': 'bg-gradient-to-r from-blue-600 from-0% via-green-600 via-50% to-yellow-500 to-100% shadow-lg',
  'Red/Blue/Green/Yellow': 'bg-gradient-to-r from-red-600 from-0% via-blue-600 via-33% via-green-600 via-66% to-yellow-500 to-100% shadow-lg'
};

// Rarity colors using One Piece TCG theme colors
export const rarityColors: Record<string, string> = {
  'C': 'text-[var(--op-neutral-silver)]',
  'UC': 'text-[var(--op-blue-light)]',
  'R': 'text-[var(--op-blue-medium)]',
  'SR': 'text-[var(--op-gold-primary)]',
  'SEC': 'text-[var(--op-gold-metallic)]',
  'L': 'text-[var(--op-red-bright)]',
  'P': 'text-[var(--op-gold-primary)]',
  'ST': 'text-[var(--op-gold-primary)]',
  'PR': 'text-[var(--op-gold-primary)]'
};

// Card type colors using One Piece TCG theme colors
export const typeColors: Record<string, string> = {
  'LEADER': 'bg-[var(--op-red-deep-crimson)]/20 text-[var(--op-red-bright)] border-[var(--op-red-deep-crimson)]/30',
  'CHARACTER': 'bg-[var(--op-blue-medium)]/20 text-[var(--op-blue-light)] border-[var(--op-blue-medium)]/30',
  'EVENT': 'bg-[var(--op-gold-primary)]/20 text-[var(--op-gold-primary)] border-[var(--op-gold-primary)]/30',
  'STAGE': 'bg-[var(--op-neutral-dark-gray)]/20 text-[var(--op-neutral-silver)] border-[var(--op-neutral-dark-gray)]/30'
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

// Rarity normalization and formatting helpers
export const normalizeRarity = (rarity: string): string => {
  if (!rarity) return '';
  // Insert underscore between lowercase and uppercase, then uppercase and replace spaces
  return rarity.trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toUpperCase();
};

export const formatRarity = (rarity: string): string => {
  if (!rarity) return '';
  // Convert to Title Case and replace underscores with spaces
  return rarity
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}; 