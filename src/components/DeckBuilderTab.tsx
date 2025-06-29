import { Plus, Trash2, Edit, BookOpen, Layers } from 'lucide-react';
import { getCardColorClass, DECK_SIZE_LIMIT, MAX_COPIES_PER_CARD } from '../utils/constants';

interface DeckBuilderTabProps {
  decks: any[];
  selectedDeck: any;
  editingDeckName: string | null;
  editingDeckNameValue: string;
  onSelectDeck: (deck: any) => void;
  onEditDeckName: (deckId: string) => void;
  onEditingDeckNameValueChange: (value: string) => void;
  onUpdateDeckName: (deckId: string, newName: string) => void;
  onCancelEditDeckName: () => void;
  onDeleteDeck: (deckId: string) => void;
  onCreateDeck: () => void;
  onImportDeck: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportDeck: (deck: any) => void;
  onRemoveCardFromDeck: (cardId: string) => void;
  onUpdateCardQuantity: (cardId: string, quantity: number) => void;
  getTotalCards: (deck: any) => number;
  getDeckStatistics: (deck: any) => any;
}

export default function DeckBuilderTab({
  decks,
  selectedDeck,
  editingDeckName,
  editingDeckNameValue,
  onSelectDeck,
  onEditDeckName,
  onEditingDeckNameValueChange,
  onUpdateDeckName,
  onCancelEditDeckName,
  onDeleteDeck,
  onCreateDeck,
  onImportDeck,
  onExportDeck,
  onRemoveCardFromDeck,
  onUpdateCardQuantity,
  getTotalCards,
  getDeckStatistics
}: DeckBuilderTabProps) {
  return (
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
                onChange={onImportDeck}
                className="hidden"
              />
              Import
            </label>
            <button
              onClick={onCreateDeck}
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
                      onChange={(e) => onEditingDeckNameValueChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateDeckName(deck.id, editingDeckNameValue);
                        } else if (e.key === 'Escape') {
                          onCancelEditDeckName();
                        }
                      }}
                      onBlur={() => {
                        onUpdateDeckName(deck.id, editingDeckNameValue);
                      }}
                      className="flex-1 px-2 py-1 bg-op-blue-deep-navy text-op-white-pure border border-op-gold-primary/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
                      autoFocus
                    />
                  </div>
                ) : (
                  <h4 
                    className="font-semibold text-op-white-pure cursor-pointer hover:text-op-gold-primary transition-colors"
                    onClick={() => onSelectDeck(deck)}
                  >
                    {deck.name}
                  </h4>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-sm text-op-blue-light">{getTotalCards(deck)}/{DECK_SIZE_LIMIT}</span>
                  <button
                    onClick={() => onEditDeckName(deck.id)}
                    className="text-op-blue-light hover:text-op-gold-primary transition-colors"
                    title="Edit deck name"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteDeck(deck.id)}
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
                  onClick={() => onExportDeck(selectedDeck)}
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
                            <span className="text-xs text-op-white-pure">{color}: {count as number}</span>
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
                    onClick={() => onRemoveCardFromDeck(selectedDeck.leader!.id)}
                    className="text-op-red-bright hover:text-op-red-medium ml-auto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDeck.cards.map(({ card, quantity }: { card: any; quantity: number }) => (
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
                        onClick={() => onUpdateCardQuantity(card.id, quantity - 1)}
                        className="w-6 h-6 bg-op-blue-medium hover:bg-op-blue-medium-alt text-op-white-pure rounded border border-op-gold-primary/30 flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm bg-op-gold-primary/20 text-op-gold-primary px-2 py-1 rounded border border-op-gold-primary/30 min-w-[2rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateCardQuantity(card.id, quantity + 1)}
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
                      onClick={() => onRemoveCardFromDeck(card.id)}
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
              onClick={onCreateDeck}
              className="bg-op-red-medium hover:bg-op-red-medium-alt text-op-white-cream px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              Create Your First Deck
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 