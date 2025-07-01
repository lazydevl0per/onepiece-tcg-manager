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

// Progressive loading state
let isLoadingProgressively = false;
let loadedPacks = new Set<string>();
let progressiveLoadingCallbacks: Array<(cards: CardData[], progress: number) => void> = [];

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const BATCH_SIZE = 3; // Load 3 packs at a time

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

// Helper function to get cached or remote image path
const getCachedOrRemoteImagePath = async (imgUrl: string): Promise<string> => {
  // Check if we're in Electron
  const isElectron = detectElectron();
  
  if (isElectron) {
    try {
      // Use the full URL from vegapull data (img_full_url)
      // If imgUrl is a relative path, construct the full URL
      let fullUrl: string;
      if (imgUrl.startsWith('http')) {
        fullUrl = imgUrl;
      } else {
        // Extract filename and construct official URL
        const filename = imgUrl.split('/').pop()?.split('?')[0];
        if (filename) {
          fullUrl = `https://en.onepiece-cardgame.com/images/cardlist/card/${filename}`;
        } else {
          // Fallback to original URL
          fullUrl = imgUrl;
        }
      }
      
      // Use the new Electron API for caching
      return await (window as any).api.getCardImagePath(fullUrl);
    } catch (error) {
      console.error('Error getting cached image path:', error);
      // Fallback to remote URL
      return imgUrl.startsWith('http') ? imgUrl : `https://en.onepiece-cardgame.com/images/cardlist/card/${imgUrl.split('/').pop()}`;
    }
  } else {
    // In web mode, use the remote URL directly
    if (imgUrl.startsWith('http')) {
      return imgUrl;
    } else {
      const filename = imgUrl.split('/').pop()?.split('?')[0];
      return filename ? `https://en.onepiece-cardgame.com/images/cardlist/card/${filename}` : imgUrl;
    }
  }
};

// Transform vegapull card to application card format
const transformVegapullCard = async (vegapullCard: VegapullCard, packData: PackData): Promise<CardData> => {
  const localImagePath = await getCachedOrRemoteImagePath(vegapullCard.img_url);
  
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
  const hasApi = !!(window as typeof window & { api?: unknown }).api;
  const hasElectron = !!(window as typeof window & { electron?: unknown }).electron;
  
  // Check if we're running in development mode (localhost:5173 is Vite dev server)
  const isDevServer = window.location.hostname === 'localhost' && window.location.port === '5173';
  
  // In development, prefer web mode for easier debugging
  if (isDevServer) {
    return false;
  }
  
  return isElectronUA || hasApi || hasElectron;
};

// Dynamic import function for card data
const importCardData = async (packId: string): Promise<VegapullCard[]> => {
  try {
    // Use local server for Electron builds, fallback to static path for web
    const isElectron = detectElectron();
    const baseUrl = isElectron ? 'http://localhost:3001' : '';
    
    const url = `${baseUrl}/data/english/json/cards_${packId}.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for ${url}`);
    }
    const data = await response.json();
    return data;
  } catch (_error) {
    return [];
  }
};

// Dynamic import function for pack data
const importPackData = async (): Promise<PackData[]> => {
  try {
    // Use local server for Electron builds, fallback to static path for web
    const isElectron = detectElectron();
    const baseUrl = isElectron ? 'http://localhost:3001' : '';
    
    const url = `${baseUrl}/data/english/json/packs.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for ${url}`);
    }
    const data = await response.json();
    return data;
  } catch (_error) {
    return [];
  }
};

// Progressive card loading with rate limiting
const loadCardsProgressively = async (onProgress?: (cards: CardData[], progress: number) => void): Promise<CardData[]> => {
  if (isLoadingProgressively) {
    // If already loading, wait for it to complete
    return new Promise((resolve) => {
      progressiveLoadingCallbacks.push((cards, progress) => {
        if (progress >= 1) {
          resolve(cards);
        }
      });
    });
  }

  isLoadingProgressively = true;
  progressiveLoadingCallbacks = [];

  try {
    // Load pack data first
    const packsData = await importPackData();
    if (packsData.length === 0) {
      allCardDataCache = [];
      isLoadingProgressively = false;
      return allCardDataCache;
    }
    
    const packMap = new Map(packsData.map(pack => [pack.id, pack]));

    // Define all pack IDs
    const packIds = [
      '569001', '569002', '569003', '569004', '569005', '569006', '569007', '569008', '569009', '569010',
      '569011', '569012', '569013', '569014', '569015', '569016', '569017', '569018', '569019', '569020',
      '569021', '569023', '569024', '569025', '569026', '569027', '569028',
      '569101', '569102', '569103', '569104', '569105', '569106', '569107', '569108', '569109', '569110', '569111',
      '569201', '569202', '569301', '569801', '569901'
    ];

    const allVegapullCards: VegapullCard[] = [];
    const totalPacks = packIds.length;
    let loadedCount = 0;

    // Load packs in batches with rate limiting
    for (let i = 0; i < packIds.length; i += BATCH_SIZE) {
      const batch = packIds.slice(i, i + BATCH_SIZE);
      
      // Load batch of packs
      const batchPromises = batch.map(async (packId) => {
        if (loadedPacks.has(packId)) {
          return []; // Skip if already loaded
        }
        
        const cards = await importCardData(packId);
        loadedPacks.add(packId);
        return cards;
      });

      const batchResults = await Promise.all(batchPromises);
      
      // Add cards from this batch
      batchResults.forEach(cards => {
        allVegapullCards.push(...cards);
      });

      loadedCount += batch.length;
      const progress = loadedCount / totalPacks;

      // Transform cards loaded so far
      const transformedCards = await Promise.all(allVegapullCards.map(async card => {
        const packData = packMap.get(card.pack_id);
        if (!packData) {
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
      }));

      // Update cache and notify progress
      allCardDataCache = transformedCards;
      onProgress?.(transformedCards, progress);
      progressiveLoadingCallbacks.forEach(callback => callback(transformedCards, progress));

      // Rate limiting delay (except for the last batch)
      if (i + BATCH_SIZE < packIds.length) {
        await delay(RATE_LIMIT_DELAY);
      }
    }

    isLoadingProgressively = false;
    return allCardDataCache || [];

  } catch (error) {
    isLoadingProgressively = false;
    console.error('Error loading cards progressively:', error);
    allCardDataCache = [];
    return allCardDataCache;
  }
};

// All card data combined - loaded lazily with progressive loading
const getAllCardData = async (onProgress?: (cards: CardData[], progress: number) => void): Promise<CardData[]> => {
  if (!allCardDataCache) {
    return await loadCardsProgressively(onProgress);
  }
  
  return allCardDataCache || [];
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

// Get static metadata (doesn't depend on card data)
const getStaticSets = (): SetInfo[] => {
  return [
    { id: 'OP01', name: 'OP01', code: 'OP01' },
    { id: 'OP02', name: 'OP02', code: 'OP02' },
    { id: 'OP03', name: 'OP03', code: 'OP03' },
    { id: 'OP04', name: 'OP04', code: 'OP04' },
    { id: 'OP05', name: 'OP05', code: 'OP05' },
    { id: 'OP06', name: 'OP06', code: 'OP06' },
    { id: 'ST01', name: 'ST01', code: 'ST01' },
    { id: 'ST02', name: 'ST02', code: 'ST02' },
    { id: 'ST03', name: 'ST03', code: 'ST03' },
    { id: 'ST04', name: 'ST04', code: 'ST04' },
    { id: 'ST05', name: 'ST05', code: 'ST05' },
    { id: 'ST06', name: 'ST06', code: 'ST06' },
    { id: 'ST07', name: 'ST07', code: 'ST07' },
    { id: 'ST08', name: 'ST08', code: 'ST08' },
    { id: 'ST09', name: 'ST09', code: 'ST09' },
    { id: 'ST10', name: 'ST10', code: 'ST10' },
    { id: 'ST11', name: 'ST11', code: 'ST11' },
    { id: 'ST12', name: 'ST12', code: 'ST12' },
    { id: 'ST13', name: 'ST13', code: 'ST13' },
    { id: 'ST14', name: 'ST14', code: 'ST14' },
    { id: 'ST15', name: 'ST15', code: 'ST15' },
    { id: 'ST16', name: 'ST16', code: 'ST16' },
    { id: 'ST17', name: 'ST17', code: 'ST17' },
    { id: 'ST18', name: 'ST18', code: 'ST18' },
    { id: 'ST19', name: 'ST19', code: 'ST19' },
    { id: 'ST20', name: 'ST20', code: 'ST20' },
    { id: 'ST21', name: 'ST21', code: 'ST21' },
    { id: 'ST23', name: 'ST23', code: 'ST23' },
    { id: 'ST24', name: 'ST24', code: 'ST24' },
    { id: 'ST25', name: 'ST25', code: 'ST25' },
    { id: 'ST26', name: 'ST26', code: 'ST26' },
    { id: 'ST27', name: 'ST27', code: 'ST27' },
    { id: 'ST28', name: 'ST28', code: 'ST28' },
    { id: 'PROMO', name: 'PROMO', code: 'PROMO' },
    { id: 'OTHER', name: 'OTHER', code: 'OTHER' }
  ];
};

const getStaticColors = (): string[] => {
  return ['RED', 'GREEN', 'BLUE', 'PURPLE', 'BLACK', 'YELLOW'];
};

const getStaticTypes = (): string[] => {
  return ['LEADER', 'CHARACTER', 'EVENT', 'STAGE'];
};

const getStaticRarities = (): string[] => {
  return ['COMMON', 'UNCOMMON', 'RARE', 'SUPER_RARE', 'SECRET_RARE', 'PROMO'];
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
export const getAllCards = async (onProgress?: (cards: AppCard[], progress: number) => void): Promise<AppCard[]> => {
  const cardData = await getAllCardData((cards, progress) => {
    const appCards = cards.map(convertToAppCard);
    onProgress?.(appCards, progress);
  });
  return cardData.map(convertToAppCard);
};

// Get all sets
export const getSets = async (): Promise<SetInfo[]> => {
  // Return static sets immediately, then update with dynamic data if available
  const staticSets = getStaticSets();
  if (!setsCache) {
    setsCache = staticSets;
    // Update with dynamic data in background
    getUniqueSets().then(dynamicSets => {
      setsCache = dynamicSets;
    }).catch(() => {
      // Keep static sets if dynamic loading fails
    });
  }
  return setsCache || staticSets;
};

// Get all colors
export const getColors = async (): Promise<string[]> => {
  // Return static colors immediately, then update with dynamic data if available
  const staticColors = getStaticColors();
  if (!colorsCache) {
    colorsCache = staticColors;
    // Update with dynamic data in background
    getUniqueColors().then(dynamicColors => {
      colorsCache = dynamicColors;
    }).catch(() => {
      // Keep static colors if dynamic loading fails
    });
  }
  return colorsCache || staticColors;
};

// Get all types
export const getTypes = async (): Promise<string[]> => {
  // Return static types immediately, then update with dynamic data if available
  const staticTypes = getStaticTypes();
  if (!typesCache) {
    typesCache = staticTypes;
    // Update with dynamic data in background
    getUniqueTypes().then(dynamicTypes => {
      typesCache = dynamicTypes;
    }).catch(() => {
      // Keep static types if dynamic loading fails
    });
  }
  return typesCache || staticTypes;
};

// Get all rarities
export const getRarities = async (): Promise<string[]> => {
  // Return static rarities immediately, then update with dynamic data if available
  const staticRarities = getStaticRarities();
  if (!raritiesCache) {
    raritiesCache = staticRarities;
    // Update with dynamic data in background
    getUniqueRarities().then(dynamicRarities => {
      raritiesCache = dynamicRarities;
    }).catch(() => {
      // Keep static rarities if dynamic loading fails
    });
  }
  return raritiesCache || staticRarities;
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