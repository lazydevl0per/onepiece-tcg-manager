import { useState, useEffect } from 'react';
import { type AppCard } from '../services/cardDataService';
import { DECK_SIZE_LIMIT, MAX_COPIES_PER_CARD } from '../utils/constants';
import { StorageService } from '../services/storageService';

// Updated Deck interface to use AppCard
export interface Deck {
  id: string;
  name: string;
  leader?: AppCard;
  cards: { card: AppCard; quantity: number }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckStatistics {
  totalCards: number;
  averageCost: string;
  characters: number;
  events: number;
  colorBreakdown: Record<string, number>;
}

export function useDeckBuilder() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [editingDeckName, setEditingDeckName] = useState<string | null>(null);
  const [editingDeckNameValue, setEditingDeckNameValue] = useState('');

  // Load saved decks on component mount
  useEffect(() => {
    const savedDeckData = StorageService.loadDecks();
    if (savedDeckData) {
      setDecks(savedDeckData.decks);
      if (savedDeckData.selectedDeckId) {
        const selected = savedDeckData.decks.find(d => d.id === savedDeckData.selectedDeckId);
        setSelectedDeck(selected || null);
      }
    }
  }, []);

  const createDeck = () => {
    const newDeck: Deck = {
      id: Date.now().toString(),
      name: `New Deck ${decks.length + 1}`,
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updatedDecks = [...decks, newDeck];
    setDecks(updatedDecks);
    setSelectedDeck(newDeck);
    StorageService.saveDecks(updatedDecks, newDeck.id);
  };

  const removeCardFromDeck = (cardId: string) => {
    if (!selectedDeck) return;
    
    const updatedDeck = { ...selectedDeck };
    
    // Check if it's the leader
    if (updatedDeck.leader?.id === cardId) {
      updatedDeck.leader = undefined;
    } else {
      updatedDeck.cards = updatedDeck.cards.filter(c => c.card.id !== cardId);
    }
    
    updatedDeck.updatedAt = new Date();
    const updatedDecks = decks.map(d => d.id === updatedDeck.id ? updatedDeck : d);
    setDecks(updatedDecks);
    setSelectedDeck(updatedDeck);
    StorageService.saveDecks(updatedDecks, updatedDeck.id);
  };

  const addCardToDeck = (card: AppCard) => {
    if (!selectedDeck) return;
    
    const updatedDeck = { ...selectedDeck };
    
    // Check if it's a leader card
    if (card.type === 'LEADER') {
      if (updatedDeck.leader) {
        alert('A deck can only have one leader card');
        return;
      }
      updatedDeck.leader = card;
    } else {
      // Check deck size limit
      const currentTotal = getTotalCards(updatedDeck);
      if (currentTotal >= DECK_SIZE_LIMIT) {
        alert(`Deck is full (${DECK_SIZE_LIMIT} cards maximum)`);
        return;
      }
      
      // Check if card already exists in deck
      const existingCard = updatedDeck.cards.find(c => c.card.id === card.id);
      if (existingCard) {
        if (existingCard.quantity >= MAX_COPIES_PER_CARD) {
          alert(`Maximum ${MAX_COPIES_PER_CARD} copies of this card allowed`);
          return;
        }
        existingCard.quantity += 1;
      } else {
        updatedDeck.cards.push({ card, quantity: 1 });
      }
    }
    
    updatedDeck.updatedAt = new Date();
    const updatedDecks = decks.map(d => d.id === updatedDeck.id ? updatedDeck : d);
    setDecks(updatedDecks);
    setSelectedDeck(updatedDeck);
    StorageService.saveDecks(updatedDecks, updatedDeck.id);
  };

  const updateCardQuantity = (cardId: string, quantity: number) => {
    if (!selectedDeck) return;
    
    const updatedDeck = { ...selectedDeck };
    const cardEntry = updatedDeck.cards.find(c => c.card.id === cardId);
    
    if (cardEntry) {
      if (quantity <= 0) {
        updatedDeck.cards = updatedDeck.cards.filter(c => c.card.id !== cardId);
      } else if (quantity > MAX_COPIES_PER_CARD) {
        alert(`Maximum ${MAX_COPIES_PER_CARD} copies of this card allowed`);
        return;
      } else {
        cardEntry.quantity = quantity;
      }
      
      updatedDeck.updatedAt = new Date();
      const updatedDecks = decks.map(d => d.id === updatedDeck.id ? updatedDeck : d);
      setDecks(updatedDecks);
      setSelectedDeck(updatedDeck);
      StorageService.saveDecks(updatedDecks, updatedDeck.id);
    }
  };

  const updateDeckName = (deckId: string, newName: string) => {
    const updatedDeck = decks.find(d => d.id === deckId);
    if (updatedDeck) {
      updatedDeck.name = newName;
      updatedDeck.updatedAt = new Date();
      const updatedDecks = decks.map(d => d.id === deckId ? updatedDeck : d);
      setDecks(updatedDecks);
      if (selectedDeck?.id === deckId) {
        setSelectedDeck(updatedDeck);
      }
      StorageService.saveDecks(updatedDecks, selectedDeck?.id || null);
    }
  };

  const deleteDeck = (deckId: string) => {
    const updatedDecks = decks.filter(d => d.id !== deckId);
    setDecks(updatedDecks);
    const newSelectedDeck = selectedDeck?.id === deckId ? null : selectedDeck;
    setSelectedDeck(newSelectedDeck);
    StorageService.saveDecks(updatedDecks, newSelectedDeck?.id || null);
  };

  const exportDeck = (deck: Deck) => {
    const deckData = {
      name: deck.name,
      leader: deck.leader,
      cards: deck.cards,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt
    };
    
    const blob = new Blob([JSON.stringify(deckData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importDeck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const deckData = JSON.parse(e.target?.result as string);
        const newDeck: Deck = {
          id: Date.now().toString(),
          name: deckData.name || 'Imported Deck',
          leader: deckData.leader,
          cards: deckData.cards || [],
          createdAt: new Date(deckData.createdAt) || new Date(),
          updatedAt: new Date()
        };
        const updatedDecks = [...decks, newDeck];
        setDecks(updatedDecks);
        setSelectedDeck(newDeck);
        StorageService.saveDecks(updatedDecks, newDeck.id);
      } catch {
        alert('Invalid deck file format');
      }
    };
    reader.readAsText(file);
  };

  const getTotalCards = (deck: Deck) => {
    const leaderCount = deck.leader ? 1 : 0;
    const cardCount = deck.cards.reduce((sum, c) => sum + c.quantity, 0);
    return leaderCount + cardCount;
  };

  const getDeckStatistics = (deck: Deck) => {
    const allCards = deck.leader ? [deck.leader, ...deck.cards.map(c => c.card)] : deck.cards.map(c => c.card);
    const totalCards = getTotalCards(deck);
    
    const totalCost = allCards.reduce((sum, card) => sum + (card.cost || 0), 0);
    const averageCost = totalCards > 0 ? (totalCost / totalCards).toFixed(1) : '0';
    
    const characters = deck.cards.filter(c => c.card.type === 'CHARACTER').reduce((sum, c) => sum + c.quantity, 0);
    const events = deck.cards.filter(c => c.card.type === 'EVENT').reduce((sum, c) => sum + c.quantity, 0);
    
    const colorBreakdown: Record<string, number> = {};
    allCards.forEach(card => {
      const count = card.id === deck.leader?.id ? 1 : deck.cards.find(c => c.card.id === card.id)?.quantity || 0;
      colorBreakdown[card.color] = (colorBreakdown[card.color] || 0) + count;
    });
    
    return {
      totalCards,
      averageCost,
      characters,
      events,
      colorBreakdown
    };
  };

  // Check if a card is in the selected deck
  const isCardInDeck = (card: AppCard) => {
    if (!selectedDeck) return false;
    if (selectedDeck.leader?.id === card.id) return true;
    return selectedDeck.cards.some(c => c.card.id === card.id);
  };

  const getCardQuantityInDeck = (card: AppCard) => {
    if (!selectedDeck) return 0;
    if (selectedDeck.leader?.id === card.id) return 1;
    const cardEntry = selectedDeck.cards.find(c => c.card.id === card.id);
    return cardEntry ? cardEntry.quantity : 0;
  };

  // Wrapper for setSelectedDeck that also saves to localStorage
  const selectDeck = (deck: Deck | null) => {
    setSelectedDeck(deck);
    StorageService.saveDecks(decks, deck?.id || null);
  };

  return {
    // State
    decks,
    selectedDeck,
    editingDeckName,
    editingDeckNameValue,
    
    // Actions
    setSelectedDeck: selectDeck,
    setEditingDeckName,
    setEditingDeckNameValue,
    createDeck,
    removeCardFromDeck,
    addCardToDeck,
    updateCardQuantity,
    updateDeckName,
    deleteDeck,
    exportDeck,
    importDeck,
    
    // Utility functions
    getTotalCards,
    getDeckStatistics,
    isCardInDeck,
    getCardQuantityInDeck
  };
} 