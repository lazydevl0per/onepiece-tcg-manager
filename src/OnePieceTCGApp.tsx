import { useState } from 'react';
import { Search, Plus, Trash2, Edit, BookOpen, Layers } from 'lucide-react';

// Types
interface Card {
  id: string;
  name: string;
  cost: number;
  power?: number;
  counter?: number;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'black' | 'colorless';
  type: 'Leader' | 'Character' | 'Event' | 'Stage';
  rarity: 'C' | 'UC' | 'R' | 'SR' | 'SEC' | 'L' | 'P';
  set: string;
  number: string;
  effect?: string;
  image?: string;
  owned: number;
}

interface Deck {
  id: string;
  name: string;
  leader?: Card;
  cards: { card: Card; quantity: number }[];
  createdAt: Date;
  updatedAt: Date;
}

// Updated color mapping using One Piece TCG palette
const colorMap = {
  red: 'bg-op-red-bright',
  blue: 'bg-op-blue-medium',
  green: 'bg-green-500', // Keep original green for now
  yellow: 'bg-op-gold-primary',
  purple: 'bg-purple-500', // Keep original purple for now
  black: 'bg-op-neutral-black',
  colorless: 'bg-op-neutral-silver'
};

// Updated rarity colors using One Piece TCG palette
const rarityColors = {
  C: 'text-op-neutral-silver',
  UC: 'text-op-blue-light',
  R: 'text-op-blue-medium',
  SR: 'text-op-gold-primary',
  SEC: 'text-op-gold-metallic',
  L: 'text-op-red-bright',
  P: 'text-op-gold-secondary'
};

// Sample data
const sampleCards: Card[] = [
  {
    id: '1',
    name: 'Monkey.D.Luffy',
    cost: 0,
    power: 5000,
    color: 'red',
    type: 'Leader',
    rarity: 'L',
    set: 'ST01',
    number: '001',
    effect: '[Activate: Main] [Once Per Turn] Give up to 1 of your Leader or Character cards +1000 power during this turn.',
    owned: 1
  },
  {
    id: '2',
    name: 'Roronoa Zoro',
    cost: 5,
    power: 6000,
    counter: 1000,
    color: 'red',
    type: 'Character',
    rarity: 'SR',
    set: 'ST01',
    number: '013',
    effect: '[On Play] K.O. up to 1 of your opponent\'s Characters with a cost of 4 or less.',
    owned: 2
  },
  {
    id: '3',
    name: 'Nami',
    cost: 1,
    power: 2000,
    counter: 1000,
    color: 'red',
    type: 'Character',
    rarity: 'C',
    set: 'ST01',
    number: '007',
    effect: '[On Play] Look at 3 cards from the top of your deck; reveal up to 1 {Straw Hat Crew} type card other than [Nami] and add it to your hand.',
    owned: 3
  }
];

export default function OnePieceTCGApp() {
  const [activeTab, setActiveTab] = useState<'collection' | 'deckbuilder'>('collection');
  const [cards, setCards] = useState<Card[]>(sampleCards);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState<Partial<Card>>({
    owned: 1,
    cost: 0,
    color: 'red',
    type: 'Character',
    rarity: 'C'
  });

  // Filter cards based on search and filters
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.effect?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesColor = colorFilter === 'all' || card.color === colorFilter;
    const matchesType = typeFilter === 'all' || card.type === typeFilter;
    const matchesRarity = rarityFilter === 'all' || card.rarity === rarityFilter;
    
    return matchesSearch && matchesColor && matchesType && matchesRarity;
  });

  const addCard = () => {
    if (!newCard.name) return;
    
    const card: Card = {
      id: Date.now().toString(),
      name: newCard.name,
      cost: newCard.cost || 0,
      power: newCard.power,
      counter: newCard.counter,
      color: newCard.color as Card['color'],
      type: newCard.type as Card['type'],
      rarity: newCard.rarity as Card['rarity'],
      set: newCard.set || 'CUSTOM',
      number: newCard.number || '000',
      effect: newCard.effect,
      owned: newCard.owned || 1
    };
    
    setCards([...cards, card]);
    setNewCard({ owned: 1, cost: 0, color: 'red', type: 'Character', rarity: 'C' });
    setShowAddCard(false);
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

  const addCardToDeck = (card: Card) => {
    if (!selectedDeck) return;
    
    const existingCard = selectedDeck.cards.find(c => c.card.id === card.id);
    if (existingCard) {
      existingCard.quantity += 1;
    } else {
      selectedDeck.cards.push({ card, quantity: 1 });
    }
    
    selectedDeck.updatedAt = new Date();
    setDecks(decks.map(d => d.id === selectedDeck.id ? selectedDeck : d));
  };

  const removeCardFromDeck = (cardId: string) => {
    if (!selectedDeck) return;
    
    selectedDeck.cards = selectedDeck.cards.filter(c => c.card.id !== cardId);
    selectedDeck.updatedAt = new Date();
    setDecks(decks.map(d => d.id === selectedDeck.id ? selectedDeck : d));
  };

  const getTotalCards = (deck: Deck) => {
    return deck.cards.reduce((total, c) => total + c.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-op-blue-deep-navy via-op-blue-medium to-op-blue-light text-op-white-pure">
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
                  ? 'bg-op-blue-medium text-op-white-pure shadow-lg border border-op-gold-primary/30'
                  : 'text-op-blue-light hover:text-op-white-pure hover:bg-op-blue-medium/20'
              }`}
            >
              <BookOpen size={20} />
              Collection
            </button>
            <button
              onClick={() => setActiveTab('deckbuilder')}
              className={`px-6 py-3 rounded-md transition-all flex items-center gap-2 ${
                activeTab === 'deckbuilder'
                  ? 'bg-op-red-medium text-op-white-cream shadow-lg border border-op-gold-primary/30'
                  : 'text-op-red-bright hover:text-op-white-cream hover:bg-op-red-medium/20'
              }`}
            >
              <Layers size={20} />
              Deck Builder
            </button>
          </div>
        </div>

        {activeTab === 'collection' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-op-blue-deep-navy/40 backdrop-blur-sm rounded-xl p-6 mb-6 border border-op-gold-primary/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-op-blue-light" size={20} />
                    <input
                      type="text"
                      placeholder="Search cards..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-op-blue-medium/20 border border-op-gold-primary/30 rounded-lg text-op-white-pure placeholder-op-blue-light focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
                    />
                  </div>
                </div>
                
                <select
                  value={colorFilter}
                  onChange={(e) => setColorFilter(e.target.value)}
                  className="px-3 py-2 bg-op-blue-medium/20 border border-op-gold-primary/30 rounded-lg text-op-white-pure focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
                >
                  <option value="all">All Colors</option>
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="yellow">Yellow</option>
                  <option value="purple">Purple</option>
                  <option value="black">Black</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-op-blue-medium/20 border border-op-gold-primary/30 rounded-lg text-op-white-pure focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
                >
                  <option value="all">All Types</option>
                  <option value="Leader">Leader</option>
                  <option value="Character">Character</option>
                  <option value="Event">Event</option>
                  <option value="Stage">Stage</option>
                </select>

                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  className="px-3 py-2 bg-op-blue-medium/20 border border-op-gold-primary/30 rounded-lg text-op-white-pure focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
                >
                  <option value="all">All Rarities</option>
                  <option value="C">Common</option>
                  <option value="UC">Uncommon</option>
                  <option value="R">Rare</option>
                  <option value="SR">Super Rare</option>
                  <option value="SEC">Secret</option>
                  <option value="L">Leader</option>
                  <option value="P">Promo</option>
                </select>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <p className="text-op-blue-light">
                  {filteredCards.length} cards found
                </p>
                <button
                  onClick={() => setShowAddCard(true)}
                  className="bg-op-gold-primary hover:bg-op-gold-secondary text-op-neutral-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-semibold"
                >
                  <Plus size={20} />
                  Add Card
                </button>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCards.map(card => (
                <div key={card.id} className="bg-op-blue-deep-navy/60 backdrop-blur-sm rounded-xl p-4 border border-op-gold-primary/30 hover:border-op-gold-primary/60 transition-all shadow-lg hover:shadow-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${colorMap[card.color]} shadow-sm`}></div>
                      <span className="text-sm text-op-blue-light">{card.set}-{card.number}</span>
                    </div>
                    <span className={`text-sm font-bold ${rarityColors[card.rarity]}`}>
                      {card.rarity}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2 text-op-white-pure">{card.name}</h3>
                  
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <span className="bg-op-gold-primary/20 text-op-gold-primary px-2 py-1 rounded border border-op-gold-primary/30">{card.type}</span>
                    <span className="text-op-blue-light">Cost: {card.cost}</span>
                    {card.power && <span className="text-op-blue-light">Power: {card.power}</span>}
                    {card.counter && <span className="text-op-gold-primary">Counter: +{card.counter}</span>}
                  </div>
                  
                  {card.effect && (
                    <p className="text-sm text-op-blue-light-alt mb-3 line-clamp-3">
                      {card.effect}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-op-blue-light">Owned: {card.owned}</span>
                    {activeTab.includes('deckbuilder') && selectedDeck && (
                      <button
                        onClick={() => addCardToDeck(card)}
                        className="bg-op-red-medium hover:bg-op-red-medium-alt text-op-white-cream px-3 py-1 rounded text-sm transition-colors font-semibold"
                      >
                        Add to Deck
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Card Modal */}
            {showAddCard && (
              <div className="fixed inset-0 bg-op-neutral-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-op-blue-deep-navy rounded-xl p-6 w-full max-w-md border border-op-gold-primary/30">
                  <h3 className="text-xl font-bold mb-4 text-op-white-pure">Add New Card</h3>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Card Name"
                      value={newCard.name || ''}
                      onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                      className="w-full px-3 py-2 bg-op-blue-medium/20 border border-op-gold-primary/30 rounded-lg text-op-white-pure placeholder-op-blue-light"
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Cost"
                        value={newCard.cost || 0}
                        onChange={(e) => setNewCard({...newCard, cost: parseInt(e.target.value) || 0})}
                        className="px-3 py-2 bg-op-blue-medium/20 border border-op-gold-primary/30 rounded-lg text-op-white-pure"
                      />
                      <input
                        type="number"
                        placeholder="Power"
                        value={newCard.power || ''}
                        onChange={(e) => setNewCard({...newCard, power: parseInt(e.target.value) || undefined})}
                        className="px-3 py-2 bg-op-blue-medium/20 border border-op-gold-primary/30 rounded-lg text-op-white-pure"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <select
                        value={newCard.color}
                        onChange={(e) => setNewCard({...newCard, color: e.target.value as Card['color']})}
                        className="px-3 py-2 bg-op-blue-medium/20 border border-op-gold-primary/30 rounded-lg text-op-white-pure"
                      >
                        <option value="red">Red</option>
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="yellow">Yellow</option>
                        <option value="purple">Purple</option>
                        <option value="black">Black</option>
                      </select>
                      
                      <select
                        value={newCard.type}
                        onChange={(e) => setNewCard({...newCard, type: e.target.value as Card['type']})}
                        className="px-3 py-2 bg-op-blue-medium/20 border border-op-gold-primary/30 rounded-lg text-op-white-pure"
                      >
                        <option value="Leader">Leader</option>
                        <option value="Character">Character</option>
                        <option value="Event">Event</option>
                        <option value="Stage">Stage</option>
                      </select>
                      
                      <select
                        value={newCard.rarity}
                        onChange={(e) => setNewCard({...newCard, rarity: e.target.value as Card['rarity']})}
                        className="px-3 py-2 bg-op-blue-medium/20 border border-op-gold-primary/30 rounded-lg text-op-white-pure"
                      >
                        <option value="C">Common</option>
                        <option value="UC">Uncommon</option>
                        <option value="R">Rare</option>
                        <option value="SR">Super Rare</option>
                        <option value="SEC">Secret</option>
                        <option value="L">Leader</option>
                        <option value="P">Promo</option>
                      </select>
                    </div>
                    
                    <textarea
                      placeholder="Effect text"
                      value={newCard.effect || ''}
                      onChange={(e) => setNewCard({...newCard, effect: e.target.value})}
                      className="w-full px-3 py-2 bg-op-blue-medium/20 border border-op-gold-primary/30 rounded-lg text-op-white-pure placeholder-op-blue-light h-20 resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={addCard}
                      className="flex-1 bg-op-gold-primary hover:bg-op-gold-secondary text-op-neutral-black py-2 rounded-lg transition-colors font-semibold"
                    >
                      Add Card
                    </button>
                    <button
                      onClick={() => setShowAddCard(false)}
                      className="flex-1 bg-op-neutral-dark-gray hover:bg-op-neutral-dark-gray-alt text-op-white-pure py-2 rounded-lg transition-colors"
                    >
                      Cancel
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
                <button
                  onClick={createDeck}
                  className="bg-op-gold-primary hover:bg-op-gold-secondary text-op-neutral-black px-3 py-2 rounded-lg text-sm transition-colors font-semibold"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-3">
                {decks.map(deck => (
                  <div
                    key={deck.id}
                    onClick={() => setSelectedDeck(deck)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedDeck?.id === deck.id
                        ? 'bg-op-red-medium/30 border border-op-gold-primary/50'
                        : 'bg-op-blue-medium/10 hover:bg-op-blue-medium/20 border border-op-gold-primary/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-op-white-pure">{deck.name}</h4>
                      <span className="text-sm text-op-blue-light">{getTotalCards(deck)}/50</span>
                    </div>
                    {deck.leader && (
                      <p className="text-sm text-op-red-bright mt-1">Leader: {deck.leader.name}</p>
                    )}
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
                      <p className="text-op-blue-light">Cards: {getTotalCards(selectedDeck)}/50</p>
                    </div>
                    <button className="text-op-gold-primary hover:text-op-gold-secondary">
                      <Edit size={20} />
                    </button>
                  </div>

                  {selectedDeck.leader && (
                    <div className="mb-6 p-4 bg-op-red-deep-crimson/30 rounded-lg border border-op-gold-primary/50">
                      <h4 className="font-bold text-op-gold-primary mb-2">Leader</h4>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${colorMap[selectedDeck.leader.color]} shadow-sm`}></div>
                        <span className="text-op-white-cream">{selectedDeck.leader.name}</span>
                        <span className="text-sm text-op-red-bright">Cost: {selectedDeck.leader.cost}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedDeck.cards.map(({ card, quantity }) => (
                      <div key={card.id} className="flex items-center justify-between p-3 bg-op-blue-medium/10 rounded-lg border border-op-gold-primary/20">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${colorMap[card.color]} shadow-sm`}></div>
                          <div>
                            <h5 className="font-medium text-op-white-pure">{card.name}</h5>
                            <p className="text-sm text-op-blue-light">
                              {card.type} • Cost: {card.cost}
                              {card.power && ` • Power: ${card.power}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm bg-op-gold-primary/20 text-op-gold-primary px-2 py-1 rounded border border-op-gold-primary/30">×{quantity}</span>
                          <button
                            onClick={() => removeCardFromDeck(card.id)}
                            className="text-op-red-bright hover:text-op-red-medium"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedDeck.cards.length === 0 && (
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
    </div>
  );
} 