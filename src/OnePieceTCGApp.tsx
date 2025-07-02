import { useState } from 'react';
import { AppShell, CollectionTab, DeckBuilderTab, ManageCollectionModal, LoadingProgress } from './components';
import { useCollection, useDeckBuilder, useResizeOptimization } from './hooks';
import { MAX_COPIES_PER_CARD } from './utils/constants';
import SearchAndFilters from './components/SearchAndFilters';

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

  // Create SearchAndFilters component for the header when on collection tab
  const searchAndFilters = activeTab === 'collection' ? (
    <SearchAndFilters
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
      onShowManageCollection={() => setShowManageCollection(true)}
      filteredCardsCount={collection.filteredCards.length}
      totalCardsCount={collection.cards.length}
      ownedCardsCount={collection.ownedCardsCount}
      colors={collection.colors}
      types={collection.types}
      rarities={collection.rarities}
      sets={collection.sets}
    />
  ) : undefined;

  return (
    <>
      <LoadingProgress 
        progress={collection.loadingProgress} 
        isLoading={collection.isLoading}
        isImageLoading={collection.isImageLoading}
        imageProgress={collection.imageLoadingProgress}
      />
      <AppShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoading={collection.isLoading}
        isImageLoading={collection.isImageLoading}
        collectionCount={collection.ownedCardsCount}
        deckCount={deckBuilder.decks.length}
        searchAndFilters={searchAndFilters}
      >
      {activeTab === 'collection' ? (
        <CollectionTab
          filteredCards={collection.filteredCards}
          onUpdateCardOwned={collection.updateCardOwned}
          onAddCardToDeck={deckBuilder.addCardToDeck}
          selectedDeck={deckBuilder.selectedDeck}
          isCardInDeck={deckBuilder.isCardInDeck}
          getCardQuantityInDeck={deckBuilder.getCardQuantityInDeck}
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

      <ManageCollectionModal
        isOpen={showManageCollection}
        onClose={() => setShowManageCollection(false)}
        onClearAllCollections={collection.clearAllCollections}
        onSetAllToOne={collection.setAllToOne}
        onExportCollection={collection.exportCollection}
        onImportCollection={collection.importCollection}
        onBackupAllData={collection.backupAllData}
        onRestoreAllData={collection.restoreAllData}
        totalCards={collection.cards.length}
        ownedCards={collection.ownedCardsCount}
        totalCopies={collection.totalCopies}
      />
    </AppShell>
    </>
  );
} 