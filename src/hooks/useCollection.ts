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
import { normalizeRarity } from '../utils/constants';
import { useLazyLoading } from './useLazyLoading';

export function useCollection() {
  const [cards, setCards] = useState<AppCard[]>([]);
  const [sets, setSets] = useState<SetInfo[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [setFilter, setSetFilter] = useState<string>('all');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [filteredCards, setFilteredCards] = useState<AppCard[]>([]);

  // Advanced filter states
  const [advancedTextFilter, setAdvancedTextFilter] = useState<string>('');
  const [costFilter, setCostFilter] = useState<string>('all');
  const [powerFilter, setPowerFilter] = useState<string>('all');
  const [counterFilter, setCounterFilter] = useState<string>('all');

  // Generate a key for lazy loading that changes when filters change
  const lazyLoadingKey = useMemo(() => {
    return `${searchTerm}-${colorFilter}-${typeFilter}-${rarityFilter}-${setFilter}-${showOwnedOnly}-${advancedTextFilter}-${costFilter}-${powerFilter}-${counterFilter}`;
  }, [searchTerm, colorFilter, typeFilter, rarityFilter, setFilter, showOwnedOnly, advancedTextFilter, costFilter, powerFilter, counterFilter]);

  // Lazy loading for displayed cards
  const lazyLoading = useLazyLoading({
    allCards: filteredCards,
    initialLoadCount: 50,
    loadMoreCount: 50,
    threshold: 200
  });

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
      } catch (error) {
        // Handle error silently or implement proper error state management
        console.error('❌ Failed to load card data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const doFilter = async () => {
      const result = await filterCards(
        cards,
        searchTerm,
        colorFilter,
        typeFilter,
        rarityFilter,
        setFilter,
        advancedTextFilter,
        costFilter,
        powerFilter,
        counterFilter
      );
      if (!cancelled) setFilteredCards(result.filter(card => !showOwnedOnly || card.owned > 0));
    };
    doFilter();
    return () => { cancelled = true; };
  }, [cards, searchTerm, colorFilter, typeFilter, rarityFilter, setFilter, showOwnedOnly, advancedTextFilter, costFilter, powerFilter, counterFilter]);

  // Reset lazy loading when the key changes (indicating filter criteria changed)
  useEffect(() => {
    lazyLoading.reset();
  }, [lazyLoadingKey]);

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
      // Synchronously update filteredCards for instant UI feedback
      filterCards(
        updatedCards,
        searchTerm,
        colorFilter,
        typeFilter,
        rarityFilter,
        setFilter,
        advancedTextFilter,
        costFilter,
        powerFilter,
        counterFilter
      ).then(result => {
        setFilteredCards(result.filter(card => !showOwnedOnly || card.owned > 0));
      });
      return updatedCards;
    });
  }, [searchTerm, colorFilter, typeFilter, rarityFilter, setFilter, showOwnedOnly, advancedTextFilter, costFilter, powerFilter, counterFilter]);

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
    searchTerm,
    colorFilter,
    typeFilter,
    rarityFilter,
    setFilter,
    showOwnedOnly,
    filteredCards,
    
    // Advanced filter states
    advancedTextFilter,
    costFilter,
    powerFilter,
    counterFilter,
    
    // Actions - use the setter functions directly since they're stable
    setSearchTerm,
    setColorFilter,
    setTypeFilter,
    setRarityFilter: (rarity: string) => setRarityFilter(rarity === 'all' ? 'all' : normalizeRarity(rarity)),
    setSetFilter,
    setShowOwnedOnly,
    updateCardOwned,
    
    // Advanced filter actions
    setAdvancedTextFilter,
    setCostFilter,
    setPowerFilter,
    setCounterFilter,
    
    // Collection management
    clearAllCollections,
    setAllToOne,
    exportCollection,
    importCollection,
    backupAllData,
    restoreAllData,
    
    // Computed values
    ownedCardsCount,
    totalCopies,
    
    // Lazy loading
    ...lazyLoading
  };
} 