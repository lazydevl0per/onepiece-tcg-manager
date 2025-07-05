import { AppCard } from '../services/cardDataService';
import { getCardColorClass } from '../utils/constants';

interface CardDetailsProps {
  card: AppCard;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOwned?: (cardId: string, owned: number) => void;
  onAddToDeck?: (card: AppCard) => void;
  isInDeck?: boolean;
  deckQuantity?: number;
  MAX_COPIES_PER_CARD?: number;
  canAddToDeck?: boolean;
  addToDeckDisabled?: boolean;
  addToDeckTitle?: string;
}

export default function CardDetails({
  card,
  isOpen,
  onClose,
  onUpdateOwned,
  onAddToDeck,
  isInDeck = false,
  deckQuantity = 0,
  MAX_COPIES_PER_CARD = 4,
  canAddToDeck = true,
  addToDeckDisabled = false,
  addToDeckTitle = 'Add to Deck'
}: CardDetailsProps) {
  if (!isOpen) return null;

  const handleAddToDeck = () => {
    onAddToDeck?.(card);
  };

  // Generate image path based on card ID
  const getImagePath = (cardId: string) => {
    return `./data/english/images/${cardId}.webp`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-row" style={{height: 'auto', maxHeight: '90vh'}}>
        {/* Floating Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 bg-gray-800/90 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-colors shadow-lg"
          style={{boxShadow: '0 2px 8px rgba(0,0,0,0.3)'}}
        >
          ✕
        </button>

        {/* Card Image Section */}
        <div className="w-1/2 min-w-[320px] max-w-[400px] flex items-center justify-center bg-gray-900">
          <div className="relative w-full flex items-center justify-center p-4">
            <img
              src={getImagePath(card.id)}
              alt={card.name}
              className="max-h-[600px] max-w-full object-contain mx-auto rounded-xl shadow-lg"
              style={{ background: '#fff' }}
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full flex flex-col relative p-0" style={{minHeight: 'fit-content'}}>
          {/* Fixed Header */}
          <div className="p-6 pb-2 bg-gray-900 z-10 border-b border-gray-700" style={{borderTopRightRadius: '1rem'}}>
            <h2 className="font-extrabold text-2xl leading-tight tracking-wide font-['Zen Dots',_cursive] text-white text-left">
              {card.name}
            </h2>
            {card.family && (
              <div className="text-base font-semibold text-gray-300 text-left mt-1">{card.family}</div>
            )}
            <div className="text-sm opacity-90 font-semibold text-gray-400 text-left mt-1">{card.set.name}</div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4" style={{minHeight: 0}}>
            {/* Basic Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Cost or Life */}
              {card.type === 'LEADER' ? (
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <div className="text-sm font-medium text-gray-400">Life</div>
                  <div className="text-lg font-semibold text-pink-400">{card.cost}</div>
                </div>
              ) : (
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <div className="text-sm font-medium text-gray-400">Cost</div>
                  <div className="text-lg font-semibold text-pink-400">{card.cost || '-'}</div>
                </div>
              )}
              {/* Card Type */}
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <div className="text-sm font-medium text-gray-400">Type</div>
                <div className="text-lg font-semibold text-indigo-400">{card.type}</div>
              </div>
              {card.attribute && (
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <div className="text-sm font-medium text-gray-400">Attribute</div>
                  <div className="text-lg font-semibold text-pink-400">{card.attribute.name}</div>
                </div>
              )}
              {card.power && (
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <div className="text-sm font-medium text-gray-400">Power</div>
                  <div className="text-lg font-semibold text-yellow-400">{card.power}</div>
                </div>
              )}
              {card.counter && (
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <div className="text-sm font-medium text-gray-400">Counter</div>
                  <div className="text-lg font-semibold text-blue-400">{card.counter}</div>
                </div>
              )}
              {card.color && (
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <div className="text-sm font-medium text-gray-400">Color</div>
                  <div className={`text-lg font-semibold px-2 py-1 rounded ${getCardColorClass(card.color)} text-white inline-block`}>
                    {card.color}
                  </div>
                </div>
              )}
            </div>
            {/* Card Ability */}
            {card.ability && (
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50 mb-4">
                <div className="text-sm font-bold text-blue-300 mb-2">Ability</div>
                <div className="text-blue-200 leading-relaxed">{card.ability}</div>
              </div>
            )}

            {/* Trigger */}
            {card.trigger && (
              <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-700/50 mb-4">
                <div className="text-sm font-bold text-yellow-300 mb-2">Trigger</div>
                <div className="text-yellow-200 leading-relaxed">{card.trigger}</div>
              </div>
            )}
          </div>

          {/* Fixed Add-to-Deck Controls at bottom of right pane, full width */}
          <div className="w-full p-6 bg-gray-900/95 border-t border-gray-700 shadow-2xl flex flex-col items-end gap-3" style={{borderBottomRightRadius: '1rem', borderBottomLeftRadius: '1rem'}}>
            {/* Owned Quantity Controls */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-300">Owned:</span>
              <button
                className="w-8 h-8 rounded-full bg-slate-600 text-lg font-bold text-slate-300 flex items-center justify-center shadow hover:bg-slate-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed border border-slate-500"
                onClick={() => onUpdateOwned && onUpdateOwned(card.id, Math.max(0, (card.owned || 0) - 1))}
                disabled={!onUpdateOwned || (card.owned || 0) <= 0}
                type="button"
              >
                -
              </button>
              <span className="text-lg font-semibold w-8 text-center text-white">{card.owned || 0}</span>
              <button
                className="w-8 h-8 rounded-full bg-slate-600 text-lg font-bold text-slate-300 flex items-center justify-center shadow hover:bg-slate-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed border border-slate-500"
                onClick={() => onUpdateOwned && onUpdateOwned(card.id, Math.min(MAX_COPIES_PER_CARD, (card.owned || 0) + 1))}
                disabled={!onUpdateOwned || (card.owned || 0) >= MAX_COPIES_PER_CARD}
                type="button"
              >
                +
              </button>
            </div>
            {/* Add to Deck Button */}
            {canAddToDeck && (
              <button
                onClick={handleAddToDeck}
                disabled={isInDeck || addToDeckDisabled}
                title={addToDeckTitle}
                className={`w-full px-3 py-2 text-xs rounded-lg font-bold transition-colors shadow-lg bg-yellow-500 hover:bg-yellow-600 text-slate-900 tracking-wide disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed`}
                style={{minWidth: '100px'}}
              >
                {isInDeck ? `In Deck (${deckQuantity})` : addToDeckTitle}
              </button>
            )}
            {/* Add to Deck Message (if any) */}
            {!canAddToDeck && (
              <div className="w-full text-xs text-center text-gray-400 mt-2">Select a deck to add this card.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 