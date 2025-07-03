import React from 'react';
import { AppCard } from '../services/cardDataService';

interface CardProps {
  card: AppCard;
  onUpdateOwned?: (cardId: string, owned: number) => void;
  onAddToDeck?: (card: AppCard) => void;
  isInDeck?: boolean;
  deckQuantity?: number;
  MAX_COPIES_PER_CARD?: number;
  canAddToDeck?: boolean;
  addToDeckDisabled?: boolean;
  addToDeckTitle?: string;
}

export default function Card({ 
  card, 
  onUpdateOwned, 
  onAddToDeck, 
  isInDeck = false, 
  deckQuantity = 0,
  MAX_COPIES_PER_CARD = 4,
  canAddToDeck = true,
  addToDeckDisabled = false,
  addToDeckTitle = 'Add to Deck'
}: CardProps) {
  const handleOwnedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newOwned = parseInt(event.target.value);
    onUpdateOwned?.(card.id, newOwned);
  };

  const handleAddToDeck = () => {
    onAddToDeck?.(card);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Card Header */}
      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-sm leading-tight">{card.name}</h3>
            <p className="text-xs opacity-90">{card.set.name}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{card.cost || '-'}</div>
            <div className="text-xs opacity-90">{card.type}</div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3">
        {/* Card Details */}
        <div className="space-y-2 text-sm">
          {card.attribute && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Attribute:</span>
              <span className="font-medium">{card.attribute.name}</span>
            </div>
          )}
          
          {card.power && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Power:</span>
              <span className="font-medium">{card.power}</span>
            </div>
          )}
          
          {card.counter && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Counter:</span>
              <span className="font-medium">{card.counter}</span>
            </div>
          )}
          
          {card.color && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Color:</span>
              <span className="font-medium">{card.color}</span>
            </div>
          )}
          
          {card.family && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Family:</span>
              <span className="font-medium">{card.family}</span>
            </div>
          )}
          
          {card.rarity && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Rarity:</span>
              <span className="font-medium">{card.rarity}</span>
            </div>
          )}
        </div>

        {/* Card Ability */}
        {card.ability && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
            <div className="font-medium text-gray-700 mb-1">Ability:</div>
            <div className="text-gray-600 leading-relaxed">{card.ability}</div>
          </div>
        )}

        {/* Trigger */}
        {card.trigger && (
          <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
            <div className="font-medium text-yellow-700 mb-1">Trigger:</div>
            <div className="text-yellow-600">{card.trigger}</div>
          </div>
        )}

        {/* Collection Controls */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Owned:</label>
            <select
              value={card.owned || 0}
              onChange={handleOwnedChange}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: MAX_COPIES_PER_CARD + 1 }, (_, i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* Deck Controls */}
          {canAddToDeck && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddToDeck}
                disabled={isInDeck || addToDeckDisabled}
                title={addToDeckTitle}
                className={`flex-1 px-3 py-1 text-sm rounded font-medium transition-colors ${
                  isInDeck || addToDeckDisabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isInDeck ? `In Deck (${deckQuantity})` : addToDeckTitle}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 