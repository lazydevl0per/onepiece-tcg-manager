// Import all card data from the data submodule
import op01Data from '../../data/cards/en/op01.json';
import op02Data from '../../data/cards/en/op02.json';
import op03Data from '../../data/cards/en/op03.json';
import op04Data from '../../data/cards/en/op04.json';
import op05Data from '../../data/cards/en/op05.json';
import op06Data from '../../data/cards/en/op06.json';
import op07Data from '../../data/cards/en/op07.json';
import op08Data from '../../data/cards/en/op08.json';
import op09Data from '../../data/cards/en/op09.json';
import eb01Data from '../../data/cards/en/eb01.json';
import generalData from '../../data/cards/en/general.json';
import st13Data from '../../data/cards/en/st13.json';
import st14Data from '../../data/cards/en/st14.json';
import st15Data from '../../data/cards/en/st15.json';
import st16Data from '../../data/cards/en/st16.json';
import st17Data from '../../data/cards/en/st17.json';
import st18Data from '../../data/cards/en/st18.json';
import st19Data from '../../data/cards/en/st19.json';
import st20Data from '../../data/cards/en/st20.json';
import prb01Data from '../../data/cards/en/prb01.json';

// Updated Card interface to match the actual data structure
export interface CardData {
  id: string;
  code: string;
  rarity: string;
  type: string;
  name: string;
  images: {
    small: string;
    large: string;
  };
  cost: number;
  attribute?: {
    name?: string;
    image: string;
  };
  power?: number | null;
  counter?: string | null;
  color: string;
  family?: string;
  ability?: string;
  trigger?: string;
  set: {
    name: string;
  };
  notes?: Array<{
    name: string;
    url?: string;
  }>;
}

// Application Card interface (with owned quantity)
export interface AppCard extends CardData {
  owned: number;
}

// Set information
export interface SetInfo {
  id: string;
  name: string;
  code: string;
}

// Cache for loaded card data
let allCardDataCache: CardData[] | null = null;
let setsCache: SetInfo[] | null = null;
let colorsCache: string[] | null = null;
let typesCache: string[] | null = null;
let raritiesCache: string[] | null = null;

// All card data combined - loaded lazily
const getAllCardData = (): CardData[] => {
  if (!allCardDataCache) {
    allCardDataCache = [
      ...op01Data,
      ...op02Data,
      ...op03Data,
      ...op04Data,
      ...op05Data,
      ...op06Data,
      ...op07Data,
      ...op08Data,
      ...op09Data,
      ...eb01Data,
      ...generalData,
      ...st13Data,
      ...st14Data,
      ...st15Data,
      ...st16Data,
      ...st17Data,
      ...st18Data,
      ...st19Data,
      ...st20Data,
      ...prb01Data,
    ] as CardData[];
  }
  return allCardDataCache;
};

// Extract unique sets
const getUniqueSets = (): SetInfo[] => {
  const setMap = new Map<string, SetInfo>();
  
  getAllCardData().forEach(card => {
    const setCode = card.code.split('-')[0];
    if (!setMap.has(setCode)) {
      setMap.set(setCode, {
        id: setCode,
        name: card.set.name,
        code: setCode
      });
    }
  });
  
  return Array.from(setMap.values()).sort((a, b) => a.code.localeCompare(b.code));
};

// Extract unique colors
const getUniqueColors = (): string[] => {
  const colors = new Set<string>();
  getAllCardData().forEach(card => {
    if (card.color) {
      colors.add(card.color);
    }
  });
  return Array.from(colors).sort();
};

// Extract unique types
const getUniqueTypes = (): string[] => {
  const types = new Set<string>();
  getAllCardData().forEach(card => {
    if (card.type) {
      types.add(card.type);
    }
  });
  return Array.from(types).sort();
};

// Extract unique rarities
const getUniqueRarities = (): string[] => {
  const rarities = new Set<string>();
  getAllCardData().forEach(card => {
    if (card.rarity) {
      rarities.add(card.rarity);
    }
  });
  return Array.from(rarities).sort();
};

// Convert CardData to AppCard with default owned quantity
const convertToAppCard = (cardData: CardData): AppCard => ({
  ...cardData,
  owned: 0
});

// Filter cards based on criteria
export const filterCards = (
  cards: AppCard[],
  searchTerm: string = '',
  colorFilter: string = 'all',
  typeFilter: string = 'all',
  rarityFilter: string = 'all',
  setFilter: string = 'all'
): AppCard[] => {
  return cards.filter(card => {
    const matchesSearch = !searchTerm || 
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.ability?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesColor = colorFilter === 'all' || card.color === colorFilter;
    const matchesType = typeFilter === 'all' || card.type === typeFilter;
    const matchesRarity = rarityFilter === 'all' || card.rarity === rarityFilter;
    const matchesSet = setFilter === 'all' || card.code.startsWith(setFilter);
    
    return matchesSearch && matchesColor && matchesType && matchesRarity && matchesSet;
  });
};

// Get all cards with default owned quantity
export const getAllCards = (): AppCard[] => {
  return getAllCardData().map(convertToAppCard);
};

// Get unique sets
export const getSets = (): SetInfo[] => {
  if (!setsCache) {
    setsCache = getUniqueSets();
  }
  return setsCache;
};

// Get unique colors
export const getColors = (): string[] => {
  if (!colorsCache) {
    colorsCache = getUniqueColors();
  }
  return colorsCache;
};

// Get unique types
export const getTypes = (): string[] => {
  if (!typesCache) {
    typesCache = getUniqueTypes();
  }
  return typesCache;
};

// Get unique rarities
export const getRarities = (): string[] => {
  if (!raritiesCache) {
    raritiesCache = getUniqueRarities();
  }
  return raritiesCache;
};

// Get card by ID
export const getCardById = (id: string): AppCard | undefined => {
  const cardData = getAllCardData().find(card => card.id === id);
  return cardData ? convertToAppCard(cardData) : undefined;
};

// Get cards by set
export const getCardsBySet = (setCode: string): AppCard[] => {
  return getAllCardData()
    .filter(card => card.code.startsWith(setCode))
    .map(convertToAppCard);
};

// Get leader cards
export const getLeaderCards = (): AppCard[] => {
  return getAllCardData()
    .filter(card => card.type === 'LEADER')
    .map(convertToAppCard);
};

// Get character cards
export const getCharacterCards = (): AppCard[] => {
  return getAllCardData()
    .filter(card => card.type === 'CHARACTER')
    .map(convertToAppCard);
};

// Get event cards
export const getEventCards = (): AppCard[] => {
  return getAllCardData()
    .filter(card => card.type === 'EVENT')
    .map(convertToAppCard);
};

// Get stage cards
export const getStageCards = (): AppCard[] => {
  return getAllCardData()
    .filter(card => card.type === 'STAGE')
    .map(convertToAppCard);
}; 