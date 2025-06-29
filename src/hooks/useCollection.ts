import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getAllCards, 
  getSets, 
  getColors, 
  getTypes, 
  getRarities,
  type AppCard,
  type SetInfo
} from '../services/cardDataService';

export function useCollection() {
  const [cards, setCards] = useState<AppCard[]>([]);
  const [sets, setSets] = useState<SetInfo[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [setFilter, setSetFilter] = useState<string>('all');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);

  // Load card data and metadata on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [allCards, allSets, allColors, allTypes, allRarities] = await Promise.all([
          getAllCards(),
          getSets(),
          getColors(),
          getTypes(),
          getRarities()
        ]);
        
        setCards(allCards);
        setSets(allSets);
        setColors(allColors);
        setTypes(allTypes);
        setRarities(allRarities);
      } catch (error) {
        console.error('Failed to load card data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Memoize filtered cards to prevent recalculation on every render
  const filteredCards = useMemo(() => {
    // For now, filter synchronously since we have all cards in memory
    // In the future, we could make this async if needed
    const filtered = cards.filter(card => {
      const matchesSearch = !searchTerm || 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesColor = colorFilter === 'all' || card.color === colorFilter;
      const matchesType = typeFilter === 'all' || card.type === typeFilter;
      const matchesRarity = rarityFilter === 'all' || card.rarity === rarityFilter;
      const matchesSet = setFilter === 'all' || card.set.name === setFilter;
      
      return matchesSearch && matchesColor && matchesType && matchesRarity && matchesSet;
    });
    
    return filtered.filter(card => !showOwnedOnly || card.owned > 0);
  }, [cards, searchTerm, colorFilter, typeFilter, rarityFilter, setFilter, showOwnedOnly]);

  // Optimize card update function
  const updateCardOwned = useCallback((cardId: string, owned: number) => {
    setCards(prevCards => prevCards.map(card => 
      card.id === cardId ? { ...card, owned } : card
    ));
  }, []);

  // Memoize expensive calculations
  const ownedCardsCount = useMemo(() => cards.filter(c => c.owned > 0).length, [cards]);
  const totalCopies = useMemo(() => cards.reduce((sum, c) => sum + c.owned, 0), [cards]);

  return {
    // State
    cards,
    sets,
    colors,
    types,
    rarities,
    isLoading,
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
    setRarityFilter,
    setSetFilter,
    setShowOwnedOnly,
    updateCardOwned,
    
    // Computed values
    ownedCardsCount,
    totalCopies
  };
} 