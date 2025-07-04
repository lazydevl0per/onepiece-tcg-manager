import { type AppCard } from '../services/cardDataService';
import { type Deck } from '../hooks/useDeckBuilder';
import Card from './Card';
import { useMemo } from 'react';

interface CollectionTabProps {
  filteredCards: AppCard[];
  displayedCards: AppCard[];
  hasMore: boolean;
  isLoadingMore: boolean;
  loadingTriggerRef: React.RefObject<HTMLDivElement | null>;
  onUpdateCardOwned: (cardId: string, owned: number) => void;
  onAddCardToDeck?: (card: AppCard) => void;
  selectedDeck: Deck | null;
  isCardInDeck?: (card: AppCard) => boolean;
  getCardQuantityInDeck?: (card: AppCard) => number;
  MAX_COPIES_PER_CARD: number;
}

export default function CollectionTab({
  filteredCards,
  displayedCards,
  hasMore,
  isLoadingMore,
  loadingTriggerRef,
  onUpdateCardOwned,
  onAddCardToDeck,
  selectedDeck,
  isCardInDeck,
  getCardQuantityInDeck,
  MAX_COPIES_PER_CARD
}: CollectionTabProps) {
  // Memoize card rendering to prevent unnecessary re-renders during resize
  const renderedCards = useMemo(() => 
    displayedCards.map(card => {
      // Color identity check
      let colorIdentityInvalid = false;
      let colorIdentityMessage = '';
      // Helper to get array of colors from a card
      const getColors = (c: AppCard) => c.color.split('/').map(x => x.trim());
      if (
        selectedDeck &&
        selectedDeck.leader &&
        card.type !== 'LEADER'
      ) {
        const leaderColors = getColors(selectedDeck.leader);
        const cardColors = getColors(card);
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
        const leaderColors = getColors(card);
        const mismatchedCards = selectedDeck.cards.filter(entry => {
          const cardColors = getColors(entry.card);
          return !cardColors.every(c => leaderColors.includes(c));
        });
        if (mismatchedCards.length > 0) {
          leaderColorIdentityInvalid = true;
          leaderColorIdentityMessage = `Cannot add this leader. The deck contains cards that do not match the leader's color identity (${card.color}):\n` + mismatchedCards.map(entry => `${entry.card.name} (${entry.card.color})`).join(', ');
        }
      }
      return (
        <Card
          key={card.id + '-' + card.pack_id}
          card={card}
          onUpdateOwned={onUpdateCardOwned}
          onAddToDeck={onAddCardToDeck}
          isInDeck={getCardQuantityInDeck ? getCardQuantityInDeck(card) >= MAX_COPIES_PER_CARD : false}
          deckQuantity={getCardQuantityInDeck ? getCardQuantityInDeck(card) : 0}
          canAddToDeck={!!selectedDeck}
          addToDeckDisabled={
            !!colorIdentityInvalid ||
            card.owned === 0 ||
            (!!(card.type === 'LEADER' && selectedDeck && selectedDeck.leader)) ||
            leaderColorIdentityInvalid ||
            (getCardQuantityInDeck && getCardQuantityInDeck(card) >= MAX_COPIES_PER_CARD) ||
            (getCardQuantityInDeck && getCardQuantityInDeck(card) >= card.owned)
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
              : getCardQuantityInDeck && getCardQuantityInDeck(card) >= MAX_COPIES_PER_CARD
              ? `In Deck (${getCardQuantityInDeck(card)})`
              : getCardQuantityInDeck && getCardQuantityInDeck(card) >= card.owned
              ? `Add to deck (${getCardQuantityInDeck(card)})`
              : getCardQuantityInDeck
              ? `Add to deck (${getCardQuantityInDeck(card)})`
              : 'Add to deck'
          }
        />
      );
    }), [displayedCards, onUpdateCardOwned, onAddCardToDeck, isCardInDeck, getCardQuantityInDeck, selectedDeck, MAX_COPIES_PER_CARD]);

  return (
    <div>
      {/* Deck color(s) indicator */}
      {selectedDeck && selectedDeck.leader && (
        <div className="mb-4 flex items-center space-x-2">
          <span className="font-semibold">Deck Colors:</span>
          {selectedDeck.leader.color.split('/').map(color => (
            <span key={color} className="px-2 py-1 rounded text-white" style={{ background: 'var(--op-' + color.toLowerCase() + ')' }}>{color}</span>
          ))}
        </div>
      )}
      {/* Cards Grid - Optimized for resize performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 will-change-auto">
        {renderedCards}
      </div>
      
      {/* Loading trigger for infinite scroll */}
      {hasMore && (
        <div 
          ref={loadingTriggerRef}
          className="flex justify-center items-center py-8"
        >
          {isLoadingMore ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-600">Loading more cards...</span>
            </div>
          ) : (
            <div className="h-4" /> // Invisible trigger element
          )}
        </div>
      )}
      
      {/* End of results indicator */}
      {!hasMore && filteredCards.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>You've reached the end of the results ({filteredCards.length} cards)</p>
        </div>
      )}
    </div>
  );
} 