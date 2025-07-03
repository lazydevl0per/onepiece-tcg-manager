import { normalizeRarity } from '../utils/constants';

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
  cost: number;
  attribute?: {
    name?: string;
  };
  power?: number | null;
  counter?: string | null;
  color: string;
  family?: string;
  ability?: string;
  trigger?: string;
  set: {
    code: string;
    name: string;
  };
  notes?: Array<{
    name: string;
    url?: string;
  }>;
  pack_id: string;
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

const JSON_BATCH_SIZE = 10; // Load 10 JSON packs at a time

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Transform vegapull card to application card format (optimized for speed)
const transformVegapullCard = async (vegapullCard: VegapullCard, packData: PackData): Promise<CardData> => {
  return {
    id: vegapullCard.id,
    code: vegapullCard.id,
    rarity: vegapullCard.rarity,
    type: vegapullCard.category.toUpperCase(),
    name: vegapullCard.name,
    cost: vegapullCard.cost,
    attribute: vegapullCard.attributes.length > 0 ? {
      name: vegapullCard.attributes[0]
    } : undefined,
    power: vegapullCard.power,
    counter: vegapullCard.counter ? vegapullCard.counter.toString() : null,
    color: vegapullCard.colors.join('/'),
    family: vegapullCard.types.join('/'),
    ability: vegapullCard.effect === '-' ? '' : vegapullCard.effect,
    trigger: vegapullCard.trigger || '',
    set: {
      code: packData.id,
      name: packData.raw_title
    },
    notes: [],
    pack_id: vegapullCard.pack_id
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

// Progressive card loading
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

    // Load packs in batches
    for (let i = 0; i < packIds.length; i += JSON_BATCH_SIZE) {
      const batch = packIds.slice(i, i + JSON_BATCH_SIZE);
      
      // Load batch of packs in parallel (no delay)
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

      // Only add a minimal delay to prevent blocking the UI
      if (i + JSON_BATCH_SIZE < packIds.length) {
        await delay(10); // Just 10ms to allow UI updates
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

// Update metadata caches when card data is loaded
const updateMetadataCaches = async () => {
  if (!allCardDataCache) return;
  
  // Update all metadata caches in parallel
  await Promise.allSettled([
    getUniqueSets().then(sets => { setsCache = sets; }),
    getUniqueColors().then(colors => { colorsCache = colors; }),
    getUniqueTypes().then(types => { typesCache = types; }),
    getUniqueRarities().then(rarities => { raritiesCache = rarities; })
  ]);
};

// All card data combined - loaded lazily with progressive loading
const getAllCardData = async (onProgress?: (cards: CardData[], progress: number) => void): Promise<CardData[]> => {
  if (!allCardDataCache) {
    const result = await loadCardsProgressively(onProgress);
    // Update metadata caches after card data is loaded
    updateMetadataCaches();
    return result;
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
    const matchesColor = colorFilter === 'all' || card.color.split('/').map(c => c.toLowerCase()).includes(colorFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || card.type === typeFilter;
    const matchesRarity = rarityFilter === 'all' || normalizeRarity(card.rarity) === normalizeRarity(rarityFilter);
    const matchesSet = setFilter === 'all' || card.pack_id === setFilter;
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

// Get all sets from packs.json
export const getSets = async (): Promise<SetInfo[]> => {
  if (setsCache) return setsCache;
  // Load packs.json
  const packsData = await importPackData();
  // Map to SetInfo: id = pack_id, code = label (e.g. OP-01), name = title
  setsCache = packsData.map(pack => ({
    id: pack.id, // e.g. '569101'
    code: pack.title_parts.label || pack.id, // e.g. 'OP-01' or fallback to id
    name: pack.title_parts.title || pack.raw_title // e.g. 'ROMANCE DAWN' or fallback
  }));
  return setsCache;
};

// Get all colors
export const getColors = async (): Promise<string[]> => {
  // Return cached data if available
  if (colorsCache) {
    return colorsCache;
  }
  
  // Return static colors immediately
  const staticColors = getStaticColors();
  colorsCache = staticColors;
  
  // Update with dynamic data in background only if we have card data
  if (allCardDataCache) {
    getUniqueColors().then(dynamicColors => {
      colorsCache = dynamicColors;
    }).catch(() => {
      // Keep static colors if dynamic loading fails
    });
  }
  
  return colorsCache;
};

// Get all types
export const getTypes = async (): Promise<string[]> => {
  // Return cached data if available
  if (typesCache) {
    return typesCache;
  }
  
  // Return static types immediately
  const staticTypes = getStaticTypes();
  typesCache = staticTypes;
  
  // Update with dynamic data in background only if we have card data
  if (allCardDataCache) {
    getUniqueTypes().then(dynamicTypes => {
      typesCache = dynamicTypes;
    }).catch(() => {
      // Keep static types if dynamic loading fails
    });
  }
  
  return typesCache;
};

// Get all rarities
export const getRarities = async (): Promise<string[]> => {
  // Return cached data if available
  if (raritiesCache) {
    return raritiesCache;
  }
  
  // Return static rarities immediately
  const staticRarities = getStaticRarities();
  raritiesCache = staticRarities;
  
  // Update with dynamic data in background only if we have card data
  if (allCardDataCache) {
    getUniqueRarities().then(dynamicRarities => {
      raritiesCache = dynamicRarities;
    }).catch(() => {
      // Keep static rarities if dynamic loading fails
    });
  }
  
  return raritiesCache;
};

// Cache invalidation functions
export const clearCardDataCache = () => {
  allCardDataCache = null;
  loadedPacks.clear();
  isLoadingProgressively = false;
  progressiveLoadingCallbacks = [];
};

export const clearMetadataCache = () => {
  setsCache = null;
  colorsCache = null;
  typesCache = null;
  raritiesCache = null;
};

export const clearAllCaches = () => {
  clearCardDataCache();
  clearMetadataCache();
};

// Get card by ID
export const getCardById = async (id: string): Promise<AppCard | undefined> => {
  // Use cached data if available, otherwise load
  if (allCardDataCache) {
    const card = allCardDataCache.find(card => card.id === id);
    return card ? convertToAppCard(card) : undefined;
  }
  
  // Only load if not cached
  const cards = await getAllCards();
  return cards.find(card => card.id === id);
};

// Get cards by set
export const getCardsBySet = async (setCode: string): Promise<AppCard[]> => {
  // Use cached data if available, otherwise load
  if (allCardDataCache) {
    return allCardDataCache
      .filter(card => card.set.name === setCode)
      .map(convertToAppCard);
  }
  
  // Only load if not cached
  const cards = await getAllCards();
  return cards.filter(card => card.set.name === setCode);
};

// Get leader cards
export const getLeaderCards = async (): Promise<AppCard[]> => {
  // Use cached data if available, otherwise load
  if (allCardDataCache) {
    return allCardDataCache
      .filter(card => card.type === 'LEADER')
      .map(convertToAppCard);
  }
  
  // Only load if not cached
  const cards = await getAllCards();
  return cards.filter(card => card.type === 'LEADER');
};

// Get character cards
export const getCharacterCards = async (): Promise<AppCard[]> => {
  // Use cached data if available, otherwise load
  if (allCardDataCache) {
    return allCardDataCache
      .filter(card => card.type === 'CHARACTER')
      .map(convertToAppCard);
  }
  
  // Only load if not cached
  const cards = await getAllCards();
  return cards.filter(card => card.type === 'CHARACTER');
};

// Get event cards
export const getEventCards = async (): Promise<AppCard[]> => {
  // Use cached data if available, otherwise load
  if (allCardDataCache) {
    return allCardDataCache
      .filter(card => card.type === 'EVENT')
      .map(convertToAppCard);
  }
  
  // Only load if not cached
  const cards = await getAllCards();
  return cards.filter(card => card.type === 'EVENT');
};

// Get stage cards
export const getStageCards = async (): Promise<AppCard[]> => {
  // Use cached data if available, otherwise load
  if (allCardDataCache) {
    return allCardDataCache
      .filter(card => card.type === 'STAGE')
      .map(convertToAppCard);
  }
  
  // Only load if not cached
  const cards = await getAllCards();
  return cards.filter(card => card.type === 'STAGE');
};