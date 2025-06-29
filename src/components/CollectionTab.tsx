import { type AppCard } from '../services/cardDataService';
import SearchAndFilters from './SearchAndFilters';
import Card from './Card';
import ManageCollectionModal from './ManageCollectionModal';

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
  showManageCollection: boolean;
  onShowManageCollection: (show: boolean) => void;
  onUpdateCardOwned: (cardId: string, owned: number) => void;
  onAddCardToDeck?: (card: AppCard) => void;
  selectedDeck?: any;
  isCardInDeck?: (card: AppCard) => boolean;
  getCardQuantityInDeck?: (card: AppCard) => number;
  colors: string[];
  types: string[];
  rarities: string[];
  sets: any[];
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
  showManageCollection,
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
  const ownedCardsCount = cards.filter(c => c.owned > 0).length;
  const totalCopies = cards.reduce((sum, c) => sum + c.owned, 0);

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
        onShowManageCollection={() => onShowManageCollection(true)}
        filteredCardsCount={filteredCards.length}
        totalCardsCount={cards.length}
        ownedCardsCount={ownedCardsCount}
        colors={colors}
        types={types}
        rarities={rarities}
        sets={sets}
      />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCards.map(card => (
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
              card.owned === 0 || 
              (isCardInDeck && getCardQuantityInDeck && 
               isCardInDeck(card) && getCardQuantityInDeck(card) >= MAX_COPIES_PER_CARD)
            }
            addToDeckTitle={
              card.owned === 0 
                ? 'You need to own this card to add it to your deck'
                : isCardInDeck && getCardQuantityInDeck && 
                  isCardInDeck(card) && getCardQuantityInDeck(card) >= MAX_COPIES_PER_CARD
                ? `Maximum ${MAX_COPIES_PER_CARD} copies already in deck`
                : 'Add to deck'
            }
          />
        ))}
      </div>

      <ManageCollectionModal
        isOpen={showManageCollection}
        onClose={() => onShowManageCollection(false)}
        onClearAllCollections={() => {
          cards.forEach(card => onUpdateCardOwned(card.id, 0));
        }}
        onSetAllToOne={() => {
          cards.forEach(card => onUpdateCardOwned(card.id, 1));
        }}
        totalCards={cards.length}
        ownedCards={ownedCardsCount}
        totalCopies={totalCopies}
      />
    </div>
  );
} 