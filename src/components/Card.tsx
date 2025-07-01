import { useState } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { type AppCard } from '../services/cardDataService';
import { getRarityColorClass, getTypeColorClass } from '../utils/constants';

interface CardProps {
  card: AppCard;
  owned: number;
  onUpdateOwned: (cardId: string, owned: number) => void;
  onAddToDeck?: (card: AppCard) => void;
  isInDeck?: boolean;
  deckQuantity?: number;
  canAddToDeck?: boolean;
  addToDeckDisabled?: boolean;
  addToDeckTitle?: string;
}

export default function Card({
  card,
  owned,
  onUpdateOwned,
  onAddToDeck,
  isInDeck = false,
  deckQuantity = 0,
  canAddToDeck = false,
  addToDeckDisabled = false,
  addToDeckTitle = 'Add to deck'
}: CardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleUpdateOwned = (increment: boolean) => {
    const newOwned = increment ? Math.min(owned + 1, 99) : Math.max(owned - 1, 0);
    onUpdateOwned(card.id, newOwned);
  };

  const handleAddToDeck = () => {
    if (onAddToDeck && !addToDeckDisabled) {
      onAddToDeck(card);
    }
  };

  return (
    <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50 hover:border-slate-500/50 transition-all hover:shadow-lg">
      {/* Card Image */}
      <div className="relative mb-4">
        {!imageError ? (
          <img
            src={card.images.small}
            alt={card.name}
            onError={handleImageError}
            className="w-full h-48 object-cover rounded-lg border border-slate-500/20"
          />
        ) : (
          <div className="w-full h-48 bg-slate-600/20 rounded-lg border border-slate-500/20 flex items-center justify-center">
            <div className="text-slate-400 text-sm text-center px-2">
              Image not available
            </div>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">{card.code}</span>
          <span className={`text-sm font-semibold ${getRarityColorClass(card.rarity)}`}>
            {card.rarity}
          </span>
        </div>

        <h3 className="text-lg font-bold mb-2 text-slate-50">{card.name}</h3>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400">Cost: {card.cost}</span>
          {card.power && <span className="text-slate-400">Power: {card.power}</span>}
          {card.counter && (
            <span className="text-yellow-400">Counter: +{card.counter}</span>
          )}
        </div>

        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColorClass(card.type)}`}>
          {card.type}
        </div>

        <p className="text-sm text-slate-300 mb-3 line-clamp-3">
          {card.ability || 'No effect text available.'}
        </p>

        {/* Ownership Controls */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">Owned:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpdateOwned(false)}
              className="w-6 h-6 bg-slate-600 hover:bg-slate-500 text-slate-50 rounded border border-slate-500/30 flex items-center justify-center text-sm"
            >
              <Minus size={12} />
            </button>
            <span className="text-sm text-slate-50 min-w-[2rem] text-center">{owned}</span>
            <button
              onClick={() => handleUpdateOwned(true)}
              className="w-6 h-6 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded border border-yellow-500/30 flex items-center justify-center text-sm"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Add to Deck Button */}
        {canAddToDeck && (
          <button
            onClick={handleAddToDeck}
            disabled={addToDeckDisabled}
            title={addToDeckTitle}
            className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              addToDeckDisabled
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-slate-600 text-slate-300 cursor-not-allowed'
            }`}
          >
            {isInDeck ? (
              <div className="flex items-center justify-center gap-2">
                <Trash2 size={16} />
                In Deck ({deckQuantity})
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Plus size={16} />
                Add to Deck
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
} 