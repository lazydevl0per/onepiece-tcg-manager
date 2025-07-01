import { type AppCard } from '../services/cardDataService';
import { type Deck } from '../hooks/useDeckBuilder';
import { type SetInfo } from '../services/cardDataService';
import SearchAndFilters from './SearchAndFilters';
import Card from './Card';
import { useMemo, useCallback } from 'react';

interface CollectionTabProps {
  cards: AppCard[];
  filteredCards: AppCard[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  colorFilter: string;
  onColorFilterChange: (color: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  rarityFilter: string;
  onRarityFilterChange: (rarity: string) => void;
  setFilter: string;
  onSetFilterChange: (set: string) => void;
  showOwnedOnly: boolean;
  onShowOwnedOnlyChange: (show: boolean) => void;
  onShowManageCollection: (show: boolean) => void;
  onUpdateCardOwned: (cardId: string, owned: number) => void;
  onAddCardToDeck?: (card: AppCard) => void;
  selectedDeck: Deck | null;
  isCardInDeck?: (card: AppCard) => boolean;
  getCardQuantityInDeck?: (card: AppCard) => number;
  colors: string[];
  types: string[];
  rarities: string[];
  sets: SetInfo[];
  MAX_COPIES_PER_CARD: number;
}

export default function CollectionTab({
  cards,
  filteredCards,
  searchTerm,
  onSearchChange,
  colorFilter,
  onColorFilterChange,
  typeFilter,
  onTypeFilterChange,
  rarityFilter,
  onRarityFilterChange,
  setFilter,
  onSetFilterChange,
  showOwnedOnly,
  onShowOwnedOnlyChange,
  onShowManageCollection,
  onUpdateCardOwned,
  onAddCardToDeck,
  selectedDeck,
  isCardInDeck,
  getCardQuantityInDeck,
  colors,
  types,
  rarities,
  sets,
  MAX_COPIES_PER_CARD
}: CollectionTabProps) {
  // Memoize expensive calculations
  const ownedCardsCount = useMemo(() => cards.filter(c => c.owned > 0).length, [cards]);

  // Memoize card rendering to prevent unnecessary re-renders during resize
  const renderedCards = useMemo(() => 
    filteredCards.map(card => {
      // Color identity check
      let colorIdentityInvalid = false;
      let colorIdentityMessage = '';
      if (
        selectedDeck &&
        selectedDeck.leader &&
        card.type !== 'LEADER' &&
        card.color !== 'Colorless'
      ) {
        const leaderColors = selectedDeck.leader.color.split('/').map(c => c.trim());
        const cardColors = card.color.split('/').map(c => c.trim());
        if (!cardColors.every(c => leaderColors.includes(c))) {
          colorIdentityInvalid = true;
          colorIdentityMessage = `This card's color (${card.color}) does not match your Leader's color identity (${selectedDeck.leader.color})`;
        }
      }
      // Leader color identity edge case: check if adding this leader would make the deck illegal
      let leaderColorIdentityInvalid = false;
      let leaderColorIdentityMessage = '';
      if (
        card.type === 'LEADER' &&
        selectedDeck &&
        selectedDeck.cards.length > 0
      ) {
        const leaderColors = card.color.split('/').map(c => c.trim());
        const mismatchedCards = selectedDeck.cards.filter(entry => {
          if (entry.card.color === 'Colorless') return false;
          const cardColors = entry.card.color.split('/').map(c => c.trim());
          return !cardColors.every(c => leaderColors.includes(c));
        });
        if (mismatchedCards.length > 0) {
          leaderColorIdentityInvalid = true;
          leaderColorIdentityMessage = `Cannot add this leader. The deck contains cards that do not match the leader's color identity (${card.color}):\n` + mismatchedCards.map(entry => `${entry.card.name} (${entry.card.color})`).join(', ');
        }
      }
      return (
        <Card
          key={card.id}
          card={card}
          owned={card.owned}
          onUpdateOwned={onUpdateCardOwned}
          onAddToDeck={onAddCardToDeck}
          isInDeck={isCardInDeck ? isCardInDeck(card) : false}
          deckQuantity={getCardQuantityInDeck ? getCardQuantityInDeck(card) : 0}
          canAddToDeck={!!selectedDeck}
          addToDeckDisabled={
            !!colorIdentityInvalid ||
            card.owned === 0 ||
            (!!(card.type === 'LEADER' && selectedDeck && selectedDeck.leader)) ||
            leaderColorIdentityInvalid ||
            (isCardInDeck && getCardQuantityInDeck &&
             isCardInDeck(card) && getCardQuantityInDeck(card) >= MAX_COPIES_PER_CARD)
          }
          addToDeckTitle={
            colorIdentityInvalid
              ? colorIdentityMessage
              : card.owned === 0
              ? 'You need to own this card to add it to your deck'
              : card.type === 'LEADER' && selectedDeck && selectedDeck.leader
              ? 'A deck can only have one leader card'
              : leaderColorIdentityInvalid
              ? leaderColorIdentityMessage
              : isCardInDeck && getCardQuantityInDeck &&
                isCardInDeck(card) && getCardQuantityInDeck(card) >= MAX_COPIES_PER_CARD
              ? `Maximum ${MAX_COPIES_PER_CARD} copies already in deck`
              : 'Add to deck'
          }
        />
      );
    }), [filteredCards, onUpdateCardOwned, onAddCardToDeck, isCardInDeck, getCardQuantityInDeck, selectedDeck, MAX_COPIES_PER_CARD]);

  const handleShowManageCollection = useCallback(() => {
    onShowManageCollection(true);
  }, [onShowManageCollection]);

  return (
    <div>
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        colorFilter={colorFilter}
        onColorFilterChange={onColorFilterChange}
        typeFilter={typeFilter}
        onTypeFilterChange={onTypeFilterChange}
        rarityFilter={rarityFilter}
        onRarityFilterChange={onRarityFilterChange}
        setFilter={setFilter}
        onSetFilterChange={onSetFilterChange}
        showOwnedOnly={showOwnedOnly}
        onShowOwnedOnlyChange={onShowOwnedOnlyChange}
        onShowManageCollection={handleShowManageCollection}
        filteredCardsCount={filteredCards.length}
        totalCardsCount={cards.length}
        ownedCardsCount={ownedCardsCount}
        colors={colors}
        types={types}
        rarities={rarities}
        sets={sets}
      />

      {/* Cards Grid - Optimized for resize performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 will-change-auto">
        {renderedCards}
      </div>
    </div>
  );
} 