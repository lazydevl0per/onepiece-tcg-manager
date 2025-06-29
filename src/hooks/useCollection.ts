import { useState, useEffect } from 'react';
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

  // Filter cards based on search and filters
  const filteredCards = filterCards(
    cards,
    searchTerm,
    colorFilter,
    typeFilter,
    rarityFilter,
    setFilter
  ).filter(card => !showOwnedOnly || card.owned > 0);

  const updateCardOwned = (cardId: string, owned: number) => {
    setCards(cards.map(card => 
      card.id === cardId ? { ...card, owned } : card
    ));
  };

  const ownedCardsCount = cards.filter(c => c.owned > 0).length;
  const totalCopies = cards.reduce((sum, c) => sum + c.owned, 0);

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
    
    // Actions
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