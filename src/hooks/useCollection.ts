import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getAllCards, 
  filterCards, 
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
        const allCards = getAllCards();
        setCards(allCards);
        setSets(getSets());
        setColors(getColors());
        setTypes(getTypes());
        setRarities(getRarities());
      } catch {
        // Error intentionally ignored
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Memoize filtered cards to prevent recalculation on every render
  const filteredCards = useMemo(() => {
    const filtered = filterCards(
      cards,
      searchTerm,
      colorFilter,
      typeFilter,
      rarityFilter,
      setFilter
    );
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