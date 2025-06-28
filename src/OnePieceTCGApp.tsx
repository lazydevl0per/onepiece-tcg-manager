import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, BookOpen, Layers, Eye, EyeOff } from 'lucide-react';
import { 
  getAllCards, 
  filterCards, 
  getSets, 
  getColors, 
  getTypes, 
  getRarities,
  type AppCard,
  type SetInfo
} from './services/cardDataService';
import { 
  colorMap, 
  rarityColors, 
  typeColors, 
  DECK_SIZE_LIMIT,
  MAX_COPIES_PER_CARD
} from './utils/constants';

// Updated Deck interface to use AppCard
interface Deck {
  id: string;
  name: string;
  leader?: AppCard;
  cards: { card: AppCard; quantity: number }[];
  createdAt: Date;
  updatedAt: Date;
}

export default function OnePieceTCGApp() {
  const [activeTab, setActiveTab] = useState<'collection' | 'deckbuilder'>('collection');
  const [cards, setCards] = useState<AppCard[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [setFilter, setSetFilter] = useState<string>('all');
  const [showAddCard, setShowAddCard] = useState(false);
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [sets, setSets] = useState<SetInfo[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);
  const [editingDeckName, setEditingDeckName] = useState<string | null>(null);
  const [editingDeckNameValue, setEditingDeckNameValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const updateCardOwned = (cardId: string, owned: number) => {
    setCards(cards.map(card => 
      card.id === cardId ? { ...card, owned } : card
    ));
  };

  const createDeck = () => {
    const newDeck: Deck = {
      id: Date.now().toString(),
      name: `New Deck ${decks.length + 1}`,
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setDecks([...decks, newDeck]);
    setSelectedDeck(newDeck);
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
    setDecks(decks.map(d => d.id === updatedDeck.id ? updatedDeck : d));
    setSelectedDeck(updatedDeck);
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
    setDecks(decks.map(d => d.id === updatedDeck.id ? updatedDeck : d));
    setSelectedDeck(updatedDeck);
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
      setDecks(decks.map(d => d.id === updatedDeck.id ? updatedDeck : d));
      setSelectedDeck(updatedDeck);
    }
  };

  const updateDeckName = (deckId: string, newName: string) => {
    const updatedDeck = decks.find(d => d.id === deckId);
    if (updatedDeck) {
      updatedDeck.name = newName;
      updatedDeck.updatedAt = new Date();
      setDecks(decks.map(d => d.id === deckId ? updatedDeck : d));
      if (selectedDeck?.id === deckId) {
        setSelectedDeck(updatedDeck);
      }
    }
  };

  const deleteDeck = (deckId: string) => {
    if (confirm('Are you sure you want to delete this deck?')) {
      setDecks(decks.filter(d => d.id !== deckId));
      if (selectedDeck?.id === deckId) {
        setSelectedDeck(null);
      }
    }
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
        
        setDecks([...decks, newDeck]);
        setSelectedDeck(newDeck);
        alert('Deck imported successfully!');
      } catch {
        alert('Error importing deck. Please check the file format.');
        // Error intentionally ignored
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const getTotalCards = (deck: Deck) => {
    const leaderCount = deck.leader ? 1 : 0;
    const cardCount = deck.cards.reduce((total, c) => total + c.quantity, 0);
    return leaderCount + cardCount;
  };

  const getDeckStatistics = (deck: Deck) => {
    const stats = {
      totalCards: getTotalCards(deck),
      leader: deck.leader ? 1 : 0,
      characters: 0,
      events: 0,
      stages: 0,
      totalCost: 0,
      averageCost: 0,
      colorBreakdown: {} as Record<string, number>
    };

    // Count cards by type
    deck.cards.forEach(({ card, quantity }) => {
      if (card.type === 'CHARACTER') stats.characters += quantity;
      else if (card.type === 'EVENT') stats.events += quantity;
      else if (card.type === 'STAGE') stats.stages += quantity;
      
      // Calculate cost
      stats.totalCost += (card.cost || 0) * quantity;
      
      // Color breakdown
      stats.colorBreakdown[card.color] = (stats.colorBreakdown[card.color] || 0) + quantity;
    });

    // Add leader stats
    if (deck.leader) {
      stats.totalCost += deck.leader.cost || 0;
      stats.colorBreakdown[deck.leader.color] = (stats.colorBreakdown[deck.leader.color] || 0) + 1;
    }

    stats.averageCost = stats.totalCards > 0 ? Math.round(stats.totalCost / stats.totalCards * 10) / 10 : 0;
    
    return stats;
  };

  const getCardColorClass = (color: string) => {
    return colorMap[color] || 'bg-op-neutral-silver';
  };

  const getRarityColorClass = (rarity: string) => {
    return rarityColors[rarity] || 'text-op-neutral-silver';
  };

  const getTypeColorClass = (type: string) => {
    return typeColors[type] || 'bg-op-neutral-dark-gray/20 text-op-neutral-silver border-op-neutral-dark-gray/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-op-blue-deep-navy via-op-blue-medium to-op-blue-light text-op-white-pure">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-op-gold-primary mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-op-white-pure mb-2">Loading One Piece TCG Manager</h2>
            <p className="text-op-blue-light">Loading card data...</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-op-gold-primary to-op-gold-metallic bg-clip-text text-transparent">
              One Piece TCG Manager
            </h1>
            <p className="text-op-blue-light-alt">Build your collection and create powerful decks!</p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-op-neutral-black/30 rounded-lg p-1 backdrop-blur-sm border border-op-gold-primary/20">
              <button
                onClick={() => setActiveTab('collection')}
                className={`px-6 py-3 rounded-md transition-all flex items-center gap-2 ${
                  activeTab === 'collection'
                    ? 'bg-op-blue-medium hover:bg-op-blue-medium-alt text-op-white-pure shadow-lg border border-op-gold-primary/30'
                    : 'text-op-blue-light hover:text-op-white-pure hover:bg-op-blue-medium/20'
                }`}
              >
                <BookOpen size={20} />
                Collection ({cards.filter(c => c.owned > 0).length})
              </button>
              <button
                onClick={() => setActiveTab('deckbuilder')}
                className={`px-6 py-3 rounded-md transition-all flex items-center gap-2 ${
                  activeTab === 'deckbuilder'
                    ? 'bg-op-red-medium hover:bg-op-red-medium-alt text-op-white-cream shadow-lg border border-op-gold-primary/30'
                    : 'text-op-red-bright hover:text-op-white-cream hover:bg-op-red-medium/20'
                }`}
              >
                <Layers size={20} />
                Deck Builder ({decks.length})
              </button>
            </div>
          </div>

          {activeTab === 'collection' && (
            <div>
              {/* Search and Filters */}
              <div className="bg-op-blue-deep-navy/40 backdrop-blur-sm rounded-xl p-6 mb-6 border border-op-gold-primary/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-op-blue-light" size={20} />
                      <input
                        type="text"
                        placeholder="Search cards by name, ability, or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-op-blue-medium/20 border border-op-gold-primary/30 rounded-lg text-op-white-pure placeholder-op-blue-light focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
                      />
                    </div>
                  </div>
                  
                  <select
                    value={colorFilter}
                    onChange={(e) => setColorFilter(e.target.value)}
                    className="px-3 py-2 bg-op-blue-deep-navy text-op-white-pure border border-op-gold-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
                  >
                    <option value="all">All Colors</option>
                    {colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 bg-op-blue-deep-navy text-op-white-pure border border-op-gold-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
                  >
                    <option value="all">All Types</option>
                    {types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  <select
                    value={rarityFilter}
                    onChange={(e) => setRarityFilter(e.target.value)}
                    className="px-3 py-2 bg-op-blue-deep-navy text-op-white-pure border border-op-gold-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
                  >
                    <option value="all">All Rarities</option>
                    {rarities.map(rarity => (
                      <option key={rarity} value={rarity}>{rarity}</option>
                    ))}
                  </select>

                  <select
                    value={setFilter}
                    onChange={(e) => setSetFilter(e.target.value)}
                    className="px-3 py-2 bg-op-blue-deep-navy text-op-white-pure border border-op-gold-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
                  >
                    <option value="all">All Sets</option>
                    {sets.map(set => (
                      <option key={set.code} value={set.code}>{set.code} - {set.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <p className="text-op-blue-light">
                      {filteredCards.length} cards found
                    </p>
                    <button
                      onClick={() => setShowOwnedOnly(!showOwnedOnly)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                        showOwnedOnly 
                          ? 'bg-op-gold-primary text-op-neutral-black' 
                          : 'bg-op-blue-medium/20 text-op-blue-light hover:bg-op-blue-medium/30'
                      }`}
                    >
                      {showOwnedOnly ? <EyeOff size={16} /> : <Eye size={16} />}
                      {showOwnedOnly ? 'Show All' : 'Owned Only'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-op-blue-light">
                      Collection: {cards.filter(c => c.owned > 0).length}/{cards.length} cards
                    </div>
                    <button
                      onClick={() => setShowAddCard(true)}
                      className="bg-op-gold-primary hover:bg-op-gold-secondary text-op-neutral-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-semibold"
                    >
                      <Plus size={20} />
                      Manage Collection
                    </button>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCards.map(card => (
                  <div key={card.id} className="bg-op-blue-deep-navy/60 backdrop-blur-sm rounded-xl p-4 border border-op-gold-primary/30 hover:border-op-gold-primary/60 transition-all shadow-lg hover:shadow-xl">
                    {/* Card Image */}
                    {card.images?.small && (
                      <div className="mb-3 relative">
                        <img 
                          src={card.images.small} 
                          alt={card.name}
                          className="w-full h-48 object-cover rounded-lg border border-op-gold-primary/20"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                          style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                        />
                        <div className="absolute inset-0 bg-op-blue-deep-navy/20 rounded-lg border border-op-gold-primary/20 flex items-center justify-center">
                          <div className="text-op-blue-light text-sm text-center px-2">
                            {card.name}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${getCardColorClass(card.color)} shadow-sm`}></div>
                        <span className="text-sm text-op-blue-light">{card.code}</span>
                      </div>
                      <span className={`text-sm font-bold ${getRarityColorClass(card.rarity)}`}>
                        {card.rarity}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2 text-op-white-pure">{card.name}</h3>
                    
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <span className={`px-2 py-1 rounded border ${getTypeColorClass(card.type)}`}>
                        {card.type}
                      </span>
                      <span className="text-op-blue-light">Cost: {card.cost}</span>
                      {card.power && <span className="text-op-blue-light">Power: {card.power}</span>}
                      {card.counter && card.counter !== '-' && (
                        <span className="text-op-gold-primary">Counter: +{card.counter}</span>
                      )}
                    </div>
                    
                    {card.ability && (
                      <p className="text-sm text-op-blue-light-alt mb-3 line-clamp-3">
                        {card.ability}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-op-blue-light">Owned:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateCardOwned(card.id, Math.max(0, card.owned - 1))}
                            className="w-6 h-6 bg-op-blue-medium hover:bg-op-blue-medium-alt text-op-white-pure rounded border border-op-gold-primary/30 flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="text-sm text-op-white-pure min-w-[2rem] text-center">{card.owned}</span>
                          <button
                            onClick={() => updateCardOwned(card.id, card.owned + 1)}
                            className="w-6 h-6 bg-op-gold-primary hover:bg-op-gold-secondary text-op-neutral-black rounded border border-op-gold-primary/30 flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {activeTab === 'collection' && selectedDeck && (
                        <button
                          onClick={() => addCardToDeck(card)}
                          disabled={card.owned === 0 || (isCardInDeck(card) && getCardQuantityInDeck(card) >= MAX_COPIES_PER_CARD)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            card.owned > 0 && (!isCardInDeck(card) || getCardQuantityInDeck(card) < MAX_COPIES_PER_CARD)
                              ? 'bg-op-red-medium hover:bg-op-red-medium-alt text-op-white-cream'
                              : 'bg-op-neutral-dark-gray text-op-neutral-silver cursor-not-allowed'
                          }`}
                          title={
                            card.owned === 0 
                              ? 'You need to own this card to add it to your deck'
                              : isCardInDeck(card) && getCardQuantityInDeck(card) >= MAX_COPIES_PER_CARD
                              ? `Maximum ${MAX_COPIES_PER_CARD} copies already in deck`
                              : 'Add to deck'
                          }
                        >
                          {isCardInDeck(card) 
                            ? `In Deck (${getCardQuantityInDeck(card)})`
                            : 'Add to Deck'
                          }
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Manage Collection Modal */}
              {showAddCard && (
                <div className="fixed inset-0 bg-op-neutral-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-op-blue-deep-navy rounded-xl p-6 w-full max-w-2xl border border-op-gold-primary/30 max-h-[80vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4 text-op-white-pure">Manage Your Collection</h3>
                    
                    <div className="space-y-4">
                      <p className="text-op-blue-light">
                        Use the + and - buttons on each card to adjust your collection. 
                        Cards with 0 copies will be hidden when "Owned Only" is enabled.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-op-blue-medium/10 p-4 rounded-lg border border-op-gold-primary/20">
                          <h4 className="font-semibold text-op-white-pure mb-2">Collection Stats</h4>
                          <p className="text-sm text-op-blue-light">Total Cards: {cards.length}</p>
                          <p className="text-sm text-op-blue-light">Owned Cards: {cards.filter(c => c.owned > 0).length}</p>
                          <p className="text-sm text-op-blue-light">Total Copies: {cards.reduce((sum, c) => sum + c.owned, 0)}</p>
                        </div>
                        
                        <div className="bg-op-blue-medium/10 p-4 rounded-lg border border-op-gold-primary/20">
                          <h4 className="font-semibold text-op-white-pure mb-2">Quick Actions</h4>
                          <button
                            onClick={() => {
                              setCards(cards.map(c => ({ ...c, owned: 0 })));
                            }}
                            className="block w-full text-left text-sm text-op-red-bright hover:text-op-red-medium mb-1"
                          >
                            Clear All Collections
                          </button>
                          <button
                            onClick={() => {
                              setCards(cards.map(c => ({ ...c, owned: 1 })));
                            }}
                            className="block w-full text-left text-sm text-op-gold-primary hover:text-op-gold-secondary"
                          >
                            Set All to 1 Copy
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowAddCard(false)}
                        className="flex-1 bg-op-gold-primary hover:bg-op-gold-secondary text-op-neutral-black py-2 rounded-lg transition-colors font-semibold"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'deckbuilder' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Deck List */}
              <div className="bg-op-blue-deep-navy/40 backdrop-blur-sm rounded-xl p-6 border border-op-gold-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-op-white-pure">Your Decks</h3>
                  <div className="flex items-center gap-2">
                    <label className="bg-op-blue-medium hover:bg-op-blue-medium-alt text-op-white-pure px-3 py-2 rounded-lg text-sm transition-colors font-semibold cursor-pointer">
                      <input
                        type="file"
                        accept=".json"
                        onChange={importDeck}
                        className="hidden"
                      />
                      Import
                    </label>
                    <button
                      onClick={createDeck}
                      className="bg-op-gold-primary hover:bg-op-gold-secondary text-op-neutral-black px-3 py-2 rounded-lg text-sm transition-colors font-semibold"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {decks.map(deck => (
                    <div
                      key={deck.id}
                      className={`p-4 rounded-lg transition-all ${
                        selectedDeck?.id === deck.id
                          ? 'bg-op-red-medium/30 border border-op-gold-primary/50'
                          : 'bg-op-blue-medium/10 hover:bg-op-blue-medium/20 border border-op-gold-primary/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {editingDeckName === deck.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingDeckNameValue}
                              onChange={(e) => setEditingDeckNameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateDeckName(deck.id, editingDeckNameValue);
                                  setEditingDeckName(null);
                                } else if (e.key === 'Escape') {
                                  setEditingDeckName(null);
                                }
                              }}
                              onBlur={() => {
                                updateDeckName(deck.id, editingDeckNameValue);
                                setEditingDeckName(null);
                              }}
                              className="flex-1 px-2 py-1 bg-op-blue-deep-navy text-op-white-pure border border-op-gold-primary/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <h4 
                            className="font-semibold text-op-white-pure cursor-pointer hover:text-op-gold-primary transition-colors"
                            onClick={() => setSelectedDeck(deck)}
                          >
                            {deck.name}
                          </h4>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-op-blue-light">{getTotalCards(deck)}/{DECK_SIZE_LIMIT}</span>
                          <button
                            onClick={() => {
                              setEditingDeckName(deck.id);
                              setEditingDeckNameValue(deck.name);
                            }}
                            className="text-op-blue-light hover:text-op-gold-primary transition-colors"
                            title="Edit deck name"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => deleteDeck(deck.id)}
                            className="text-op-red-bright hover:text-op-red-medium transition-colors"
                            title="Delete deck"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {deck.leader && (
                        <p className="text-sm text-op-red-bright">Leader: {deck.leader.name}</p>
                      )}
                      <p className="text-xs text-op-blue-light mt-1">
                        Updated: {deck.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Deck */}
              <div className="lg:col-span-2">
                {selectedDeck ? (
                  <div className="bg-op-blue-deep-navy/40 backdrop-blur-sm rounded-xl p-6 border border-op-gold-primary/20">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-op-white-pure">{selectedDeck.name}</h3>
                        <p className="text-op-blue-light">Cards: {getTotalCards(selectedDeck)}/{DECK_SIZE_LIMIT}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => exportDeck(selectedDeck)}
                          className="text-op-blue-light hover:text-op-blue-medium transition-colors"
                          title="Export deck"
                        >
                          <BookOpen size={20} />
                        </button>
                        <button className="text-op-gold-primary hover:text-op-gold-secondary">
                          <Edit size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Deck Statistics */}
                    {(() => {
                      const stats = getDeckStatistics(selectedDeck);
                      return (
                        <div className="mb-6 p-4 bg-op-blue-medium/10 rounded-lg border border-op-gold-primary/20">
                          <h4 className="font-bold text-op-gold-primary mb-3">Deck Statistics</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-op-blue-light">Total Cards</p>
                              <p className="text-op-white-pure font-semibold">{stats.totalCards}/{DECK_SIZE_LIMIT}</p>
                            </div>
                            <div>
                              <p className="text-op-blue-light">Average Cost</p>
                              <p className="text-op-white-pure font-semibold">{stats.averageCost}</p>
                            </div>
                            <div>
                              <p className="text-op-blue-light">Characters</p>
                              <p className="text-op-white-pure font-semibold">{stats.characters}</p>
                            </div>
                            <div>
                              <p className="text-op-blue-light">Events</p>
                              <p className="text-op-white-pure font-semibold">{stats.events}</p>
                            </div>
                          </div>
                          {Object.keys(stats.colorBreakdown).length > 0 && (
                            <div className="mt-3">
                              <p className="text-op-blue-light text-sm mb-2">Color Breakdown:</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(stats.colorBreakdown).map(([color, count]) => (
                                  <div key={color} className="flex items-center gap-1">
                                    <div className={`w-3 h-3 rounded-full ${getCardColorClass(color)}`}></div>
                                    <span className="text-xs text-op-white-pure">{color}: {count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {selectedDeck.leader && (
                      <div className="mb-6 p-4 bg-op-red-deep-crimson/30 rounded-lg border border-op-gold-primary/50">
                        <h4 className="font-bold text-op-gold-primary mb-2">Leader</h4>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getCardColorClass(selectedDeck.leader.color)} shadow-sm`}></div>
                          <span className="text-op-white-cream">{selectedDeck.leader.name}</span>
                          <span className="text-sm text-op-red-bright">Cost: {selectedDeck.leader.cost}</span>
                          <button
                            onClick={() => removeCardFromDeck(selectedDeck.leader!.id)}
                            className="text-op-red-bright hover:text-op-red-medium ml-auto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedDeck.cards.map(({ card, quantity }) => (
                        <div key={card.id} className="flex items-center justify-between p-3 bg-op-blue-medium/10 rounded-lg border border-op-gold-primary/20">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getCardColorClass(card.color)} shadow-sm`}></div>
                            <div>
                              <h5 className="font-medium text-op-white-pure">{card.name}</h5>
                              <p className="text-sm text-op-blue-light">
                                {card.type} • Cost: {card.cost}
                                {card.power && ` • Power: ${card.power}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateCardQuantity(card.id, quantity - 1)}
                                className="w-6 h-6 bg-op-blue-medium hover:bg-op-blue-medium-alt text-op-white-pure rounded border border-op-gold-primary/30 flex items-center justify-center text-sm"
                              >
                                -
                              </button>
                              <span className="text-sm bg-op-gold-primary/20 text-op-gold-primary px-2 py-1 rounded border border-op-gold-primary/30 min-w-[2rem] text-center">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateCardQuantity(card.id, quantity + 1)}
                                disabled={quantity >= MAX_COPIES_PER_CARD}
                                className={`w-6 h-6 rounded border border-op-gold-primary/30 flex items-center justify-center text-sm ${
                                  quantity >= MAX_COPIES_PER_CARD
                                    ? 'bg-op-neutral-dark-gray text-op-neutral-silver cursor-not-allowed'
                                    : 'bg-op-gold-primary hover:bg-op-gold-secondary text-op-neutral-black'
                                }`}
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeCardFromDeck(card.id)}
                              className="text-op-red-bright hover:text-op-red-medium"
                              title="Remove from deck"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedDeck.cards.length === 0 && !selectedDeck.leader && (
                      <div className="text-center py-12 text-op-blue-light">
                        <Layers size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No cards in this deck yet.</p>
                        <p className="text-sm">Switch to Collection tab to add cards.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-op-blue-deep-navy/40 backdrop-blur-sm rounded-xl p-6 text-center border border-op-gold-primary/20">
                    <Layers size={48} className="mx-auto mb-4 text-op-blue-light" />
                    <h3 className="text-xl font-bold mb-2 text-op-white-pure">No Deck Selected</h3>
                    <p className="text-op-blue-light mb-4">Create a new deck or select an existing one to start building.</p>
                    <button
                      onClick={createDeck}
                      className="bg-op-red-medium hover:bg-op-red-medium-alt text-op-white-cream px-6 py-3 rounded-lg transition-colors font-semibold"
                    >
                      Create Your First Deck
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 