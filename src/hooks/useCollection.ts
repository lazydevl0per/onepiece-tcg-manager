import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getAllCards, 
  getSets, 
  getColors, 
  getTypes, 
  getRarities,
  filterCards,
  type AppCard,
  type SetInfo
} from '../services/cardDataService';
import { StorageService } from '../services/storageService';
import { imageRateLimiter } from '../services/rateLimiter';
import { normalizeRarity } from '../utils/constants';

export function useCollection() {
  const [cards, setCards] = useState<AppCard[]>([]);
  const [sets, setSets] = useState<SetInfo[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageLoadingProgress, setImageLoadingProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [setFilter, setSetFilter] = useState<string>('all');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [filteredCards, setFilteredCards] = useState<AppCard[]>([]);

  // Load card data and metadata on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🚀 Starting data loading...');
        setIsLoading(true);
        setLoadingProgress(0);
        
        // Load saved collection data once at the beginning
        const savedCollection = StorageService.loadCollection();
        
        // Load metadata first (these are small and can be loaded quickly)
        console.log('📊 Loading metadata...');
        const [allSets, allColors, allTypes, allRarities] = await Promise.all([
          getSets(),
          getColors(),
          getTypes(),
          getRarities()
        ]);
        
        console.log('✅ Metadata loaded:', { sets: allSets.length, colors: allColors.length, types: allTypes.length, rarities: allRarities.length });
        setSets(allSets);
        setColors(allColors);
        setTypes(allTypes);
        setRarities(allRarities);
        
        // Load cards progressively with progress updates
        console.log('🃏 Loading cards...');
        const allCards = await getAllCards((progressCards, progress) => {
          console.log(`📈 Loading progress: ${Math.round(progress * 100)}% (${progressCards.length} cards)`);
          
          // Merge saved collection data with card data for progress updates
          if (savedCollection) {
            const cardsWithOwned = progressCards.map(card => ({
              ...card,
              owned: savedCollection.cards[card.id] || 0
            }));
            setCards(cardsWithOwned);
          } else {
            setCards(progressCards);
          }
          
          setLoadingProgress(progress);
        });
        
        console.log('✅ All cards loaded:', allCards.length);
        
        // Final update with all cards (no need to reload saved collection)
        if (savedCollection) {
          const cardsWithOwned = allCards.map(card => ({
            ...card,
            owned: savedCollection.cards[card.id] || 0
          }));
          setCards(cardsWithOwned);
        } else {
          setCards(allCards);
        }
        
        setLoadingProgress(1);
        console.log('🎉 Setting isLoading to false - app ready!');
        setIsLoading(false); // Card data loading is complete - app is now ready to use
        
        // Start image preloading in the background (non-blocking)
        console.log('🖼️ Starting image preloading in background...');
        setTimeout(() => {
          startImagePreloading(allCards);
        }, 100); // Small delay to ensure UI is rendered first
      } catch (error) {
        // Handle error silently or implement proper error state management
        console.error('❌ Failed to load card data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Image preloading function - loads images sequentially with caching checks
  const startImagePreloading = async (allCards: AppCard[]) => {
    // Check if all images are already cached by the browser
    let allCached = true;
    for (const card of allCards) {
      const img = new window.Image();
      img.src = card.images.small;
      if (!img.complete) {
        allCached = false;
        break;
      }
    }
    if (allCached) {
      setIsImageLoading(false);
      setImageLoadingProgress(1);
      console.log('✅ All images already cached by browser. Skipping preloading.');
      return;
    }
    setIsImageLoading(true);
    setImageLoadingProgress(0);
    const totalImages = allCards.length;
    let loadedImages = 0;
    let skippedImages = 0;
    const batchSize = 5; // Load 5 images at a time
    const delayBetweenBatches = 100; // 100ms between batches
    for (let i = 0; i < totalImages; i += batchSize) {
      const batch = allCards.slice(i, i + batchSize);
      const batchPromises = batch.map(async (card) => {
        try {
          await imageRateLimiter.acquire();
          const img = new Image();
          img.src = card.images.small;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            setTimeout(resolve, 3000);
          });
        } catch (_error) {
          // Silently ignore image loading errors
        }
      });
      await Promise.all(batchPromises);
      loadedImages += batch.length;
      setImageLoadingProgress(loadedImages / totalImages);
      if (loadedImages % 50 === 0) {
        console.log(`🖼️ Image loading progress: ${Math.round((loadedImages / totalImages) * 100)}% (${loadedImages}/${totalImages}, ${skippedImages} cached)`);
      }
      if (i + batchSize < totalImages) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
    console.log(`✅ Image preloading complete! Loaded: ${loadedImages - skippedImages}, Cached: ${skippedImages}, Total: ${totalImages}`);
    setIsImageLoading(false);
    setImageLoadingProgress(1);
  };

  useEffect(() => {
    let cancelled = false;
    const doFilter = async () => {
      const result = await filterCards(
        cards,
        searchTerm,
        colorFilter,
        typeFilter,
        rarityFilter,
        setFilter
      );
      if (!cancelled) setFilteredCards(result.filter(card => !showOwnedOnly || card.owned > 0));
    };
    doFilter();
    return () => { cancelled = true; };
  }, [cards, searchTerm, colorFilter, typeFilter, rarityFilter, setFilter, showOwnedOnly]);

  // Optimize card update function with persistence
  const updateCardOwned = useCallback((cardId: string, owned: number) => {
    setCards(prevCards => {
      const updatedCards = prevCards.map(card => 
        card.id === cardId ? { ...card, owned } : card
      );
      
      // Save to localStorage after state update
      // eslint-disable-next-line no-console
      console.log('Saving collection to storage:', updatedCards.filter(c => c.owned > 0));
      StorageService.saveCollection(updatedCards);
      
      return updatedCards;
    });
  }, []);

  // Memoize expensive calculations
  const ownedCardsCount = useMemo(() => cards.filter(c => c.owned > 0).length, [cards]);
  const totalCopies = useMemo(() => cards.reduce((sum, c) => sum + c.owned, 0), [cards]);

  // Collection management functions
  const clearAllCollections = useCallback(() => {
    setCards(prevCards => {
      const clearedCards = prevCards.map(card => ({ ...card, owned: 0 }));
      StorageService.saveCollection(clearedCards);
      return clearedCards;
    });
  }, []);

  const setAllToOne = useCallback(() => {
    setCards(prevCards => {
      const updatedCards = prevCards.map(card => ({ ...card, owned: 1 }));
      StorageService.saveCollection(updatedCards);
      return updatedCards;
    });
  }, []);

  const exportCollection = useCallback(() => {
    const exportData = StorageService.exportCollection(cards);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onepiece-tcg-collection-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [cards]);

  const importCollection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = e.target?.result as string;
        const updatedCards = StorageService.importCollection(cards, importData);
        setCards(updatedCards);
        StorageService.saveCollection(updatedCards);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to import collection:', error);
        alert('Invalid collection file format');
      }
    };
    reader.readAsText(file);
  }, [cards]);

  const backupAllData = useCallback(() => {
    const backupData = StorageService.backupData();
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onepiece-tcg-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const restoreAllData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = e.target?.result as string;
        const success = StorageService.restoreData(backupData);
        if (success) {
          // Reload the page to apply the restored data
          window.location.reload();
        } else {
          alert('Failed to restore backup data');
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to restore backup:', error);
        alert('Invalid backup file format');
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    // State
    cards,
    sets,
    colors,
    types,
    rarities,
    isLoading,
    loadingProgress,
    isImageLoading,
    imageLoadingProgress,
    searchTerm,
    colorFilter,
    typeFilter,
    rarityFilter,
    setFilter,
    showOwnedOnly,
    filteredCards,
    
    // Actions - use the setter functions directly since they're stable
    setSearchTerm,
    setColorFilter,
    setTypeFilter,
    setRarityFilter: (rarity: string) => setRarityFilter(rarity === 'all' ? 'all' : normalizeRarity(rarity)),
    setSetFilter,
    setShowOwnedOnly,
    updateCardOwned,
    
    // Collection management
    clearAllCollections,
    setAllToOne,
    exportCollection,
    importCollection,
    backupAllData,
    restoreAllData,
    
    // Computed values
    ownedCardsCount,
    totalCopies
  };
} 