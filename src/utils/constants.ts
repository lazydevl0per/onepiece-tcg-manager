// Color mapping for One Piece TCG colors to CSS classes
export const colorMap: Record<string, string> = {
  'Red': 'bg-op-red-bright',
  'Blue': 'bg-op-blue-medium',
  'Green': 'bg-green-500',
  'Yellow': 'bg-op-gold-primary',
  'Purple': 'bg-purple-500',
  'Black': 'bg-op-neutral-black',
  'Colorless': 'bg-op-neutral-silver',
  'Red/Green': 'bg-gradient-to-r from-op-red-bright to-green-500',
  'Red/Blue': 'bg-gradient-to-r from-op-red-bright to-op-blue-medium',
  'Red/Yellow': 'bg-gradient-to-r from-op-red-bright to-op-gold-primary',
  'Blue/Green': 'bg-gradient-to-r from-op-blue-medium to-green-500',
  'Blue/Yellow': 'bg-gradient-to-r from-op-blue-medium to-op-gold-primary',
  'Green/Yellow': 'bg-gradient-to-r from-green-500 to-op-gold-primary',
  'Green/Purple': 'bg-gradient-to-r from-green-500 to-purple-500',
  'Yellow/Purple': 'bg-gradient-to-r from-op-gold-primary to-purple-500',
  'Red/Blue/Green': 'bg-gradient-to-r from-op-red-bright via-op-blue-medium to-green-500',
  'Red/Blue/Yellow': 'bg-gradient-to-r from-op-red-bright via-op-blue-medium to-op-gold-primary',
  'Red/Green/Yellow': 'bg-gradient-to-r from-op-red-bright via-green-500 to-op-gold-primary',
  'Blue/Green/Yellow': 'bg-gradient-to-r from-op-blue-medium via-green-500 to-op-gold-primary',
  'Red/Blue/Green/Yellow': 'bg-gradient-to-r from-op-red-bright via-op-blue-medium via-green-500 to-op-gold-primary'
};

// Rarity colors using One Piece TCG palette
export const rarityColors: Record<string, string> = {
  'C': 'text-op-neutral-silver',
  'UC': 'text-op-blue-light',
  'R': 'text-op-blue-medium',
  'SR': 'text-op-gold-primary',
  'SEC': 'text-op-gold-metallic',
  'L': 'text-op-red-bright',
  'P': 'text-op-gold-secondary',
  'ST': 'text-op-gold-primary',
  'PR': 'text-op-gold-secondary'
};

// Card type colors
export const typeColors: Record<string, string> = {
  'LEADER': 'bg-op-red-deep-crimson/20 text-op-red-bright border-op-red-bright/30',
  'CHARACTER': 'bg-op-blue-medium/20 text-op-blue-light border-op-blue-medium/30',
  'EVENT': 'bg-op-gold-primary/20 text-op-gold-primary border-op-gold-primary/30',
  'STAGE': 'bg-op-neutral-dark-gray/20 text-op-neutral-silver border-op-neutral-dark-gray/30'
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