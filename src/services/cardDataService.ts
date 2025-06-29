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
  // Use local server for Electron builds, fallback to static path for web
  const isElectron = detectElectron();
  const baseUrl = isElectron ? 'http://localhost:3001' : '';
  // Construct the path to the local image
  return `${baseUrl}/data/data/english/images/${filename}`;
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

// Helper function to detect if we're running in Electron
const detectElectron = (): boolean => {
  // Check if we're in Electron by looking at user agent or other indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const isElectronUA = userAgent.includes('electron');
  
  // Also check if window.api or window.electron are available
  const hasApi = !!(window as any).api;
  const hasElectron = !!(window as any).electron;
  
  return isElectronUA || hasApi || hasElectron;
};

// Dynamic import function for card data
const importCardData = async (packId: string): Promise<VegapullCard[]> => {
  try {
    // Use local server for Electron builds, fallback to static path for web
    const isElectron = detectElectron();
    const baseUrl = isElectron ? 'http://localhost:3001' : '';
    
    const url = `${baseUrl}/data/data/english/json/cards_${packId}.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`Failed to load card data for pack ${packId}:`, error);
    return [];
  }
};

// Dynamic import function for pack data
const importPackData = async (): Promise<PackData[]> => {
  try {
    // Use local server for Electron builds, fallback to static path for web
    const isElectron = detectElectron();
    const baseUrl = isElectron ? 'http://localhost:3001' : '';
    
    const url = `${baseUrl}/data/data/english/json/packs.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Failed to load pack data:', error);
    return [];
  }
};

// All card data combined - loaded lazily
const getAllCardData = async (): Promise<CardData[]> => {
  if (!allCardDataCache) {
    try {
      // Load pack data first
      const packsData = await importPackData();
      const packMap = new Map(packsData.map(pack => [pack.id, pack]));

      // Define all pack IDs
      const packIds = [
        '569001', '569002', '569003', '569004', '569005', '569006', '569007', '569008', '569009', '569010',
        '569011', '569012', '569013', '569014', '569015', '569016', '569017', '569018', '569019', '569020',
        '569021', '569023', '569024', '569025', '569026', '569027', '569028',
        '569101', '569102', '569103', '569104', '569105', '569106', '569107', '569108', '569109', '569110', '569111',
        '569201', '569202', '569301', '569801', '569901'
      ];

      // Load all card data
      const allVegapullCards: VegapullCard[] = [];
      
      for (const packId of packIds) {
        const cards = await importCardData(packId);
        allVegapullCards.push(...cards);
      }

      // Transform all cards
      allCardDataCache = allVegapullCards.map(card => {
        const packData = packMap.get(card.pack_id);
        if (!packData) {
          console.warn(`No pack data found for card ${card.id} with pack_id ${card.pack_id}`);
          // Create a fallback pack data
          const fallbackPack: PackData = {
            id: card.pack_id,
            raw_title: `Pack ${card.pack_id}`,
            title_parts: {
              prefix: null,
              title: `Pack ${card.pack_id}`,
              label: null
            }
          };
          return transformVegapullCard(card, fallbackPack);
        }
        return transformVegapullCard(card, packData);
      });

      console.log(`Loaded ${allCardDataCache.length} cards from ${packIds.length} packs`);
    } catch (error) {
      console.error('Failed to load card data:', error);
      allCardDataCache = [];
    }
  }
  
  return allCardDataCache;
};

// Get unique sets from loaded card data
const getUniqueSets = async (): Promise<SetInfo[]> => {
  if (!setsCache) {
    const cards = await getAllCardData();
    const setMap = new Map<string, SetInfo>();
    
    cards.forEach(card => {
      const setCode = card.set.name;
      if (!setMap.has(setCode)) {
        setMap.set(setCode, {
          id: setCode,
          name: setCode,
          code: setCode
        });
      }
    });
    
    setsCache = Array.from(setMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
  
  return setsCache;
};

// Get unique colors from loaded card data
const getUniqueColors = async (): Promise<string[]> => {
  if (!colorsCache) {
    const cards = await getAllCardData();
    const colorSet = new Set<string>();
    
    cards.forEach(card => {
      if (card.color) {
        colorSet.add(card.color);
      }
    });
    
    colorsCache = Array.from(colorSet).sort();
  }
  
  return colorsCache;
};

// Get unique types from loaded card data
const getUniqueTypes = async (): Promise<string[]> => {
  if (!typesCache) {
    const cards = await getAllCardData();
    const typeSet = new Set<string>();
    
    cards.forEach(card => {
      if (card.type) {
        typeSet.add(card.type);
      }
    });
    
    typesCache = Array.from(typeSet).sort();
  }
  
  return typesCache;
};

// Get unique rarities from loaded card data
const getUniqueRarities = async (): Promise<string[]> => {
  if (!raritiesCache) {
    const cards = await getAllCardData();
    const raritySet = new Set<string>();
    
    cards.forEach(card => {
      if (card.rarity) {
        raritySet.add(card.rarity);
      }
    });
    
    raritiesCache = Array.from(raritySet).sort();
  }
  
  return raritiesCache;
};

// Convert CardData to AppCard with owned quantity
const convertToAppCard = (cardData: CardData): AppCard => ({
  ...cardData,
  owned: 0
});

// Filter cards based on search term and filters
export const filterCards = async (
  cards: AppCard[],
  searchTerm: string = '',
  colorFilter: string = 'all',
  typeFilter: string = 'all',
  rarityFilter: string = 'all',
  setFilter: string = 'all'
): Promise<AppCard[]> => {
  return cards.filter(card => {
    const matchesSearch = !searchTerm || 
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesColor = colorFilter === 'all' || card.color === colorFilter;
    const matchesType = typeFilter === 'all' || card.type === typeFilter;
    const matchesRarity = rarityFilter === 'all' || card.rarity === rarityFilter;
    const matchesSet = setFilter === 'all' || card.set.name === setFilter;
    
    return matchesSearch && matchesColor && matchesType && matchesRarity && matchesSet;
  });
};

// Get all cards with owned quantity
export const getAllCards = async (): Promise<AppCard[]> => {
  const cardData = await getAllCardData();
  return cardData.map(convertToAppCard);
};

// Get all sets
export const getSets = async (): Promise<SetInfo[]> => {
  return await getUniqueSets();
};

// Get all colors
export const getColors = async (): Promise<string[]> => {
  return await getUniqueColors();
};

// Get all types
export const getTypes = async (): Promise<string[]> => {
  return await getUniqueTypes();
};

// Get all rarities
export const getRarities = async (): Promise<string[]> => {
  return await getUniqueRarities();
};

// Get card by ID
export const getCardById = async (id: string): Promise<AppCard | undefined> => {
  const cards = await getAllCards();
  return cards.find(card => card.id === id);
};

// Get cards by set
export const getCardsBySet = async (setCode: string): Promise<AppCard[]> => {
  const cards = await getAllCards();
  return cards.filter(card => card.set.name === setCode);
};

// Get leader cards
export const getLeaderCards = async (): Promise<AppCard[]> => {
  const cards = await getAllCards();
  return cards.filter(card => card.type === 'LEADER');
};

// Get character cards
export const getCharacterCards = async (): Promise<AppCard[]> => {
  const cards = await getAllCards();
  return cards.filter(card => card.type === 'CHARACTER');
};

// Get event cards
export const getEventCards = async (): Promise<AppCard[]> => {
  const cards = await getAllCards();
  return cards.filter(card => card.type === 'EVENT');
};

// Get stage cards
export const getStageCards = async (): Promise<AppCard[]> => {
  const cards = await getAllCards();
  return cards.filter(card => card.type === 'STAGE');
}; 