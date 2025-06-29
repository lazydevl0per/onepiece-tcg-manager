import { useState } from 'react';
import { AppShell, CollectionTab, DeckBuilderTab } from './components';
import { useCollection, useDeckBuilder, useResizeOptimization } from './hooks';
import { MAX_COPIES_PER_CARD } from './utils/constants';

export default function OnePieceTCGApp() {
  const [activeTab, setActiveTab] = useState<'collection' | 'deckbuilder'>('collection');
  const [showManageCollection, setShowManageCollection] = useState(false);

  // Custom hooks for state management
  const collection = useCollection();
  const deckBuilder = useDeckBuilder();

  // Optimize window resize performance (no forced layout recalculation)
  useResizeOptimization({
    throttleMs: 50
  });

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={collection.isLoading}
      collectionCount={collection.ownedCardsCount}
      deckCount={deckBuilder.decks.length}
    >
      {activeTab === 'collection' ? (
        <CollectionTab
          cards={collection.cards}
          filteredCards={collection.filteredCards}
          searchTerm={collection.searchTerm}
          onSearchChange={collection.setSearchTerm}
          colorFilter={collection.colorFilter}
          onColorFilterChange={collection.setColorFilter}
          typeFilter={collection.typeFilter}
          onTypeFilterChange={collection.setTypeFilter}
          rarityFilter={collection.rarityFilter}
          onRarityFilterChange={collection.setRarityFilter}
          setFilter={collection.setFilter}
          onSetFilterChange={collection.setSetFilter}
          showOwnedOnly={collection.showOwnedOnly}
          onShowOwnedOnlyChange={collection.setShowOwnedOnly}
          showManageCollection={showManageCollection}
          onShowManageCollection={setShowManageCollection}
          onUpdateCardOwned={collection.updateCardOwned}
          onAddCardToDeck={deckBuilder.addCardToDeck}
          selectedDeck={deckBuilder.selectedDeck}
          isCardInDeck={deckBuilder.isCardInDeck}
          getCardQuantityInDeck={deckBuilder.getCardQuantityInDeck}
          colors={collection.colors}
          types={collection.types}
          rarities={collection.rarities}
          sets={collection.sets}
          MAX_COPIES_PER_CARD={MAX_COPIES_PER_CARD}
        />
      ) : (
        <DeckBuilderTab
          decks={deckBuilder.decks}
          selectedDeck={deckBuilder.selectedDeck}
          editingDeckName={deckBuilder.editingDeckName}
          editingDeckNameValue={deckBuilder.editingDeckNameValue}
          onSelectDeck={deckBuilder.setSelectedDeck}
          onEditDeckName={deckBuilder.setEditingDeckName}
          onEditingDeckNameValueChange={deckBuilder.setEditingDeckNameValue}
          onUpdateDeckName={deckBuilder.updateDeckName}
          onCancelEditDeckName={() => deckBuilder.setEditingDeckName(null)}
          onDeleteDeck={deckBuilder.deleteDeck}
          onCreateDeck={deckBuilder.createDeck}
          onImportDeck={deckBuilder.importDeck}
          onExportDeck={deckBuilder.exportDeck}
          onRemoveCardFromDeck={deckBuilder.removeCardFromDeck}
          onUpdateCardQuantity={deckBuilder.updateCardQuantity}
          getTotalCards={deckBuilder.getTotalCards}
          getDeckStatistics={deckBuilder.getDeckStatistics}
        />
      )}
    </AppShell>
  );
} 