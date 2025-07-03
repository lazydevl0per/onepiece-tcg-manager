import React from 'react';
import { AppCard } from '../services/cardDataService';

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

  const handleOwnedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newOwned = parseInt(event.target.value);
    onUpdateOwned?.(card.id, newOwned);
  };

  const handleAddToDeck = () => {
    onAddToDeck?.(card);
  };

  // Generate image path based on card ID
  const getImagePath = (cardId: string) => {
    return `./data/english/images/${cardId}.webp`;
  };

  // Rarity badge color map using One Piece TCG colors
  const rarityColors: Record<string, string> = {
    'Leader': 'from-[var(--op-red-deep-crimson)] to-[var(--op-gold-primary)]',
    'Common': 'from-[var(--op-neutral-silver)] to-[var(--op-blue-deep-navy)]',
    'Uncommon': 'from-[var(--op-blue-light)] to-[var(--op-blue-medium)]',
    'Rare': 'from-[var(--op-gold-primary)] to-[var(--op-gold-metallic)]',
    'Super Rare': 'from-[var(--op-gold-primary)] to-[var(--op-gold-metallic)]',
    'Secret Rare': 'from-[var(--op-gold-metallic)] to-[var(--op-gold-primary)]',
    'Promo': 'from-[var(--op-purple-royal)] to-[var(--op-gold-primary)]',
  };
  const rarityGradient = rarityColors[card.rarity || 'Common'] || 'from-[var(--op-neutral-silver)] to-[var(--op-blue-deep-navy)]';

  // Type badge color using One Piece TCG colors
  const typeColors: Record<string, string> = {
    'Character': 'bg-[var(--op-blue-medium)]',
    'Leader': 'bg-[var(--op-red-deep-crimson)]',
    'Event': 'bg-[var(--op-gold-primary)]',
    'Stage': 'bg-[var(--op-neutral-dark-gray)]',
  };
  const typeColor = typeColors[card.type] || 'bg-[var(--op-neutral-silver)]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-white transition-colors shadow-lg"
        >
          ✕
        </button>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Card Image Section */}
          <div className="lg:w-1/2 relative">
            <div className="relative w-full h-96 lg:h-full">
              {/* Card Image Background */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${getImagePath(card.id)})`,
                  filter: 'brightness(0.95) saturate(1.15)',
                }}
              />
              
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-white/10 to-transparent backdrop-blur-[6px]" />

              {/* Rarity Badge */}
              <div className={`absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${rarityGradient} border-2 border-white/40 drop-shadow-md`}>
                {card.rarity}
              </div>
              
              {/* Type Badge */}
              <div className={`absolute top-3 right-3 z-20 px-2 py-1 rounded-full text-xs font-bold text-white shadow bg-opacity-90 ${typeColor} border-2 border-white/40`}>
                {card.type}
              </div>

              {/* Card Name and Cost */}
              <div className="absolute top-0 left-0 right-0 p-4 text-white z-20">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-extrabold text-xl leading-tight drop-shadow-lg tracking-wide font-['Zen Dots',_cursive]">
                      {card.name}
                    </h2>
                    <p className="text-sm opacity-90 drop-shadow-md font-semibold">{card.set.name}</p>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-2xl font-bold drop-shadow-lg bg-white/30 px-3 py-2 rounded-xl border border-white/40 inline-block">
                      {card.cost || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Stats */}
              <div className="grid grid-cols-2 gap-4">
                {card.attribute && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Attribute</div>
                    <div className="text-lg font-semibold text-pink-700">{card.attribute.name}</div>
                  </div>
                )}
                {card.power && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Power</div>
                    <div className="text-lg font-semibold text-yellow-700">{card.power}</div>
                  </div>
                )}
                {card.counter && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Counter</div>
                    <div className="text-lg font-semibold text-blue-700">{card.counter}</div>
                  </div>
                )}
                {card.color && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">Color</div>
                    <div className="text-lg font-semibold text-red-700">{card.color}</div>
                  </div>
                )}
              </div>

              {/* Family */}
              {card.family && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">Family</div>
                  <div className="text-lg font-semibold text-gray-800">{card.family}</div>
                </div>
              )}

              {/* Card Ability */}
              {card.ability && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm font-bold text-blue-800 mb-2">Ability</div>
                  <div className="text-blue-700 leading-relaxed">{card.ability}</div>
                </div>
              )}

              {/* Trigger */}
              {card.trigger && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="text-sm font-bold text-yellow-800 mb-2">Trigger</div>
                  <div className="text-yellow-700 leading-relaxed">{card.trigger}</div>
                </div>
              )}

              {/* Collection and Deck Controls */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                {/* Owned Quantity */}
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">Owned:</label>
                  <select
                    value={card.owned || 0}
                    onChange={handleOwnedChange}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white"
                  >
                    {Array.from({ length: MAX_COPIES_PER_CARD + 1 }, (_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>

                {/* Add to Deck Button */}
                {canAddToDeck && (
                  <button
                    onClick={handleAddToDeck}
                    disabled={isInDeck || addToDeckDisabled}
                    title={addToDeckTitle}
                    className={`w-full px-4 py-3 text-sm rounded-md font-bold transition-all duration-200 shadow-md border-2 border-pink-300 bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-yellow-400 hover:to-pink-500 text-white tracking-wide active:scale-95 active:shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed`}
                  >
                    {isInDeck ? `In Deck (${deckQuantity})` : addToDeckTitle}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 