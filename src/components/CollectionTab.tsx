import { type AppCard } from '../services/cardDataService';
import { type Deck } from '../hooks/useDeckBuilder';
import Card from './Card';
import { useMemo } from 'react';

interface CollectionTabProps {
  filteredCards: AppCard[];
  onUpdateCardOwned: (cardId: string, owned: number) => void;
  onAddCardToDeck?: (card: AppCard) => void;
  selectedDeck: Deck | null;
  isCardInDeck?: (card: AppCard) => boolean;
  getCardQuantityInDeck?: (card: AppCard) => number;
  MAX_COPIES_PER_CARD: number;
}

export default function CollectionTab({
  filteredCards,
  onUpdateCardOwned,
  onAddCardToDeck,
  selectedDeck,
  isCardInDeck,
  getCardQuantityInDeck,
  MAX_COPIES_PER_CARD
}: CollectionTabProps) {
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
          key={card.id + '-' + card.pack_id}
          card={card}
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

  return (
    <div>
      {/* Cards Grid - Optimized for resize performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 will-change-auto">
        {renderedCards}
      </div>
    </div>
  );
} 