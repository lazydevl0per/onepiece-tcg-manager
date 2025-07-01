import { Plus, Edit3, Trash2, Download, Save, X } from 'lucide-react';
import { getCardColorClass, DECK_SIZE_LIMIT } from '../utils/constants';
import { type Deck, type DeckStatistics } from '../hooks/useDeckBuilder';
import { type AppCard } from '../services/cardDataService';

interface DeckBuilderTabProps {
  decks: Deck[];
  selectedDeck: Deck | null;
  editingDeckName: string | null;
  editingDeckNameValue: string;
  onSelectDeck: (deck: Deck) => void;
  onEditDeckName: (deckId: string | null) => void;
  onEditingDeckNameValueChange: (value: string) => void;
  onUpdateDeckName: (deckId: string, newName: string) => void;
  onCancelEditDeckName: () => void;
  onDeleteDeck: (deckId: string) => void;
  onCreateDeck: () => void;
  onImportDeck: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportDeck: (deck: Deck) => void;
  onRemoveCardFromDeck: (cardId: string) => void;
  onUpdateCardQuantity: (cardId: string, quantity: number) => void;
  getTotalCards: (deck: Deck) => number;
  getDeckStatistics: (deck: Deck) => DeckStatistics;
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
      <div className="lg:col-span-1">
        <div className="bg-slate-700/40 backdrop-blur-sm rounded-xl p-6 border border-slate-600/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-50">Your Decks</h3>
            <label className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors font-semibold cursor-pointer">
              <Plus size={16} className="inline mr-1" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={onImportDeck}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-2 mb-4">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedDeck?.id === deck.id
                    ? 'bg-red-500/30 border border-yellow-500/50'
                    : 'bg-slate-600/10 hover:bg-slate-600/20 border border-slate-500/20'
                }`}
                onClick={() => onSelectDeck(deck)}
              >
                <div className="flex items-center justify-between">
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
                        className="flex-1 px-2 py-1 bg-slate-700 text-slate-50 border border-slate-500/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => onUpdateDeckName(deck.id, editingDeckNameValue)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={onCancelEditDeckName}
                        className="text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-50 cursor-pointer hover:text-yellow-400 transition-colors">
                          {deck.name}
                        </h4>
                        <span className="text-sm text-slate-300">{getTotalCards(deck)}/{DECK_SIZE_LIMIT}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditDeckName(deck.id);
                          }}
                          className="text-slate-300 hover:text-yellow-400 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDeck(deck.id);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {deck.leader && (
                  <p className="text-sm text-red-400">Leader: {deck.leader.name}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {deck.cards.length} cards • {deck.cards.reduce((sum, { quantity }) => sum + quantity, 0)} total
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={onCreateDeck}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-3 py-2 rounded-lg text-sm transition-colors font-semibold"
          >
            <Plus size={16} className="inline mr-1" />
            Create New Deck
          </button>
        </div>
      </div>

      {/* Deck Details */}
      {selectedDeck && (
        <div className="lg:col-span-2">
          <div className="bg-slate-700/40 backdrop-blur-sm rounded-xl p-6 border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-50">{selectedDeck.name}</h3>
                <p className="text-slate-300">Cards: {getTotalCards(selectedDeck)}/{DECK_SIZE_LIMIT}</p>
              </div>
              <button
                onClick={() => onExportDeck(selectedDeck)}
                className="text-slate-300 hover:text-blue-400 transition-colors"
              >
                <Download size={20} />
              </button>
            </div>

            {/* Deck Statistics */}
            {(() => {
              const stats = getDeckStatistics(selectedDeck);
              return (
                <div className="mb-6 p-4 bg-slate-600/10 rounded-lg border border-slate-500/20">
                  <h4 className="font-semibold text-slate-50 mb-3">Deck Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Total Cards</p>
                      <p className="text-slate-50 font-semibold">{stats.totalCards}/{DECK_SIZE_LIMIT}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Average Cost</p>
                      <p className="text-slate-50 font-semibold">{stats.averageCost}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Characters</p>
                      <p className="text-slate-50 font-semibold">{stats.characters}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Events</p>
                      <p className="text-slate-50 font-semibold">{stats.events}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Colors</p>
                      <p className="text-slate-50 font-semibold">{Object.keys(stats.colorBreakdown).length}</p>
                    </div>
                  </div>

                  {Object.keys(stats.colorBreakdown).length > 0 && (
                    <div className="mt-3">
                      <p className="text-slate-300 text-sm mb-2">Color Breakdown:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(stats.colorBreakdown).map(([color, count]) => (
                          <div key={color} className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${getCardColorClass(color)}`}></div>
                            <span className="text-xs text-slate-50">{color}: {count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {selectedDeck.leader && (
              <div className="mb-6 p-4 bg-red-500/30 rounded-lg border border-yellow-500/50">
                <h4 className="font-bold text-yellow-400 mb-2">Leader</h4>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getCardColorClass(selectedDeck.leader.color)} shadow-sm`}></div>
                  <span className="text-slate-100">{selectedDeck.leader.name}</span>
                  <span className="text-sm text-red-400">Cost: {selectedDeck.leader.cost}</span>
                  <button
                    onClick={() => onRemoveCardFromDeck(selectedDeck.leader!.id)}
                    className="text-red-400 hover:text-red-300 ml-auto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDeck.cards.map(({ card, quantity }: { card: AppCard; quantity: number }) => (
                <div key={card.id} className="flex items-center justify-between p-3 bg-slate-600/10 rounded-lg border border-slate-500/20">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getCardColorClass(card.color)} shadow-sm`}></div>
                    <div>
                      <h5 className="font-medium text-slate-50">{card.name}</h5>
                      <p className="text-sm text-slate-300">
                        {card.type} • Cost: {card.cost}
                        {card.power && ` • Power: ${card.power}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateCardQuantity(card.id, Math.max(0, quantity - 1))}
                      className="w-6 h-6 bg-slate-600 hover:bg-slate-500 text-slate-50 rounded border border-slate-500/30 flex items-center justify-center text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm text-slate-50 min-w-[2rem] text-center">{quantity}</span>
                    <button
                      onClick={() => onUpdateCardQuantity(card.id, quantity + 1)}
                      className="w-6 h-6 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded border border-yellow-500/30 flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemoveCardFromDeck(card.id)}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 