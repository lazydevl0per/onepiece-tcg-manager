// Import all card data from the vegapull-records submodule
import packsData from '../../data/data/english/json/packs.json';
import cards569001 from '../../data/data/english/json/cards_569001.json';
import cards569002 from '../../data/data/english/json/cards_569002.json';
import cards569003 from '../../data/data/english/json/cards_569003.json';
import cards569004 from '../../data/data/english/json/cards_569004.json';
import cards569005 from '../../data/data/english/json/cards_569005.json';
import cards569006 from '../../data/data/english/json/cards_569006.json';
import cards569007 from '../../data/data/english/json/cards_569007.json';
import cards569008 from '../../data/data/english/json/cards_569008.json';
import cards569009 from '../../data/data/english/json/cards_569009.json';
import cards569010 from '../../data/data/english/json/cards_569010.json';
import cards569011 from '../../data/data/english/json/cards_569011.json';
import cards569012 from '../../data/data/english/json/cards_569012.json';
import cards569013 from '../../data/data/english/json/cards_569013.json';
import cards569014 from '../../data/data/english/json/cards_569014.json';
import cards569015 from '../../data/data/english/json/cards_569015.json';
import cards569016 from '../../data/data/english/json/cards_569016.json';
import cards569017 from '../../data/data/english/json/cards_569017.json';
import cards569018 from '../../data/data/english/json/cards_569018.json';
import cards569019 from '../../data/data/english/json/cards_569019.json';
import cards569020 from '../../data/data/english/json/cards_569020.json';
import cards569021 from '../../data/data/english/json/cards_569021.json';
import cards569023 from '../../data/data/english/json/cards_569023.json';
import cards569024 from '../../data/data/english/json/cards_569024.json';
import cards569025 from '../../data/data/english/json/cards_569025.json';
import cards569026 from '../../data/data/english/json/cards_569026.json';
import cards569027 from '../../data/data/english/json/cards_569027.json';
import cards569028 from '../../data/data/english/json/cards_569028.json';
import cards569101 from '../../data/data/english/json/cards_569101.json';
import cards569102 from '../../data/data/english/json/cards_569102.json';
import cards569103 from '../../data/data/english/json/cards_569103.json';
import cards569104 from '../../data/data/english/json/cards_569104.json';
import cards569105 from '../../data/data/english/json/cards_569105.json';
import cards569106 from '../../data/data/english/json/cards_569106.json';
import cards569107 from '../../data/data/english/json/cards_569107.json';
import cards569108 from '../../data/data/english/json/cards_569108.json';
import cards569109 from '../../data/data/english/json/cards_569109.json';
import cards569110 from '../../data/data/english/json/cards_569110.json';
import cards569111 from '../../data/data/english/json/cards_569111.json';
import cards569201 from '../../data/data/english/json/cards_569201.json';
import cards569202 from '../../data/data/english/json/cards_569202.json';
import cards569301 from '../../data/data/english/json/cards_569301.json';
import cards569801 from '../../data/data/english/json/cards_569801.json';
import cards569901 from '../../data/data/english/json/cards_569901.json';

// Vegapull card data interface
interface VegapullCard {
  id: string;
  pack_id: string;
  name: string;
  rarity: string;
  category: string;
  img_url: string;
  img_full_url: string;
  colors: string[];
  cost: number;
  attributes: string[];
  power: number | null;
  counter: number | null;
  types: string[];
  effect: string;
  trigger: string | null;
}

// Pack data interface
interface PackData {
  id: string;
  raw_title: string;
  title_parts: {
    prefix: string | null;
    title: string;
    label: string | null;
  };
}

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
  externalImageUrl?: string;
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

// Helper function to get attribute image code
const getAttributeImageCode = (attribute: string): string => {
  const attributeMap: Record<string, string> = {
    'Strike': '01',
    'Slash': '02',
    'Ranged': '04',
    'Special': '03',
    'Wisdom': '05'
  };
  return attributeMap[attribute] || '01';
};

// Helper function to construct local image path
const getLocalImagePath = (imgUrl: string): string => {
  // Remove any query parameters from the URL
  const cleanUrl = imgUrl.split('?')[0];
  // Extract the filename from the path (e.g., "../images/cardlist/card/ST01-001.png" -> "ST01-001.png")
  const filename = cleanUrl.split('/').pop();
  // Construct the path to the local image
  return `/data/data/english/images/${filename}`;
};

// Transform vegapull card to application card format
const transformVegapullCard = (vegapullCard: VegapullCard, packData: PackData): CardData => {
  const localImagePath = getLocalImagePath(vegapullCard.img_url);
  
  return {
    id: vegapullCard.id,
    code: vegapullCard.id,
    rarity: vegapullCard.rarity,
    type: vegapullCard.category.toUpperCase(),
    name: vegapullCard.name,
    images: {
      small: localImagePath,
      large: localImagePath
    },
    cost: vegapullCard.cost,
    attribute: vegapullCard.attributes.length > 0 ? {
      name: vegapullCard.attributes[0],
      image: `https://en.onepiece-cardgame.com/images/cardlist/attribute/ico_type${getAttributeImageCode(vegapullCard.attributes[0])}.png`
    } : undefined,
    power: vegapullCard.power,
    counter: vegapullCard.counter ? vegapullCard.counter.toString() : null,
    color: vegapullCard.colors.join('/'),
    family: vegapullCard.types.join('/'),
    ability: vegapullCard.effect === '-' ? '' : vegapullCard.effect,
    trigger: vegapullCard.trigger || '',
    set: {
      name: packData.raw_title
    },
    notes: [],
    externalImageUrl: vegapullCard.img_full_url
  };
};

// All card data combined - loaded lazily
const getAllCardData = (): CardData[] => {
  if (!allCardDataCache) {
    const allVegapullCards: VegapullCard[] = [
      ...cards569001,
      ...cards569002,
      ...cards569003,
      ...cards569004,
      ...cards569005,
      ...cards569006,
      ...cards569007,
      ...cards569008,
      ...cards569009,
      ...cards569010,
      ...cards569011,
      ...cards569012,
      ...cards569013,
      ...cards569014,
      ...cards569015,
      ...cards569016,
      ...cards569017,
      ...cards569018,
      ...cards569019,
      ...cards569020,
      ...cards569021,
      ...cards569023,
      ...cards569024,
      ...cards569025,
      ...cards569026,
      ...cards569027,
      ...cards569028,
      ...cards569101,
      ...cards569102,
      ...cards569103,
      ...cards569104,
      ...cards569105,
      ...cards569106,
      ...cards569107,
      ...cards569108,
      ...cards569109,
      ...cards569110,
      ...cards569111,
      ...cards569201,
      ...cards569202,
      ...cards569301,
      ...cards569801,
      ...cards569901,
    ] as VegapullCard[];

    // Create a map of pack data for quick lookup
    const packDataMap = new Map<string, PackData>();
    (packsData as PackData[]).forEach(pack => {
      packDataMap.set(pack.id, pack);
    });

    // Transform all cards
    allCardDataCache = allVegapullCards.map(card => {
      const packData = packDataMap.get(card.pack_id);
      if (!packData) {
        // console.warn(`No pack data found for pack_id: ${card.pack_id}`); // Removed to fix linter warning
        // Create a fallback pack data
        const fallbackPack: PackData = {
          id: card.pack_id,
          raw_title: `Unknown Pack ${card.pack_id}`,
          title_parts: {
            prefix: null,
            title: `Unknown Pack ${card.pack_id}`,
            label: null
          }
        };
        return transformVegapullCard(card, fallbackPack);
      }
      return transformVegapullCard(card, packData);
    });
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
      // Split multi-color cards and add each color
      card.color.split('/').forEach(color => {
        colors.add(color.trim());
      });
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
    
    const matchesColor = colorFilter === 'all' || card.color.includes(colorFilter);
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