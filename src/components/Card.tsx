import React, { useState } from 'react';
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
  const [showAbility, setShowAbility] = useState(false);
  const [showTrigger, setShowTrigger] = useState(false);

  const handleOwnedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newOwned = parseInt(event.target.value);
    onUpdateOwned?.(card.id, newOwned);
  };

  const handleAddToDeck = () => {
    onAddToDeck?.(card);
  };

  // Generate image path based on card ID
  const getImagePath = (cardId: string) => {
    // Use relative path for Electron and Vite dev
    return `./data/english/images/${cardId}.webp`;
  };

  // Rarity badge color map
  const rarityColors: Record<string, string> = {
    'Leader': 'from-pink-400 to-yellow-400',
    'Common': 'from-blue-400 to-purple-400',
    'Uncommon': 'from-green-400 to-blue-400',
    'Rare': 'from-yellow-400 to-orange-500',
    'Super Rare': 'from-red-500 to-pink-500',
    'Secret Rare': 'from-indigo-500 to-yellow-500',
    'Promo': 'from-fuchsia-500 to-cyan-400',
  };
  const rarityGradient = rarityColors[card.rarity || 'Common'] || 'from-blue-400 to-purple-400';

  // Type badge color
  const typeColors: Record<string, string> = {
    'Character': 'bg-pink-500',
    'Leader': 'bg-yellow-500',
    'Event': 'bg-blue-500',
    'Stage': 'bg-green-500',
  };
  const typeColor = typeColors[card.type] || 'bg-gray-500';

  return (
    <div
      className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 bg-white/20 backdrop-blur-md border-2 border-white/30 hover:scale-105 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:border-pink-400 group"
      style={{ boxShadow: '0 4px 32px 0 rgba(31,38,135,0.37)' }}
    >
      {/* Sparkle overlay for anime effect */}
      <div className="pointer-events-none absolute inset-0 z-10 animate-pulse bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15)_0%,transparent_70%)]" />

      {/* Card Image Background with anime border */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat border-4 border-transparent group-hover:border-pink-300 rounded-2xl"
        style={{
          backgroundImage: `url(${getImagePath(card.id)})`,
          filter: 'brightness(0.95) saturate(1.15)',
        }}
      />

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-white/10 to-transparent backdrop-blur-[6px]" />

      {/* Rarity Badge */}
      <div className={`absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${rarityGradient} border-2 border-white/40 drop-shadow-md`}>{card.rarity}</div>
      {/* Type Badge */}
      <div className={`absolute top-3 right-3 z-20 px-2 py-1 rounded-full text-xs font-bold text-white shadow bg-opacity-90 ${typeColor} border-2 border-white/40`}>{card.type}</div>

      {/* Top Card Info */}
      <div className="absolute top-0 left-0 right-0 p-3 text-white z-20">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-lg leading-tight truncate drop-shadow-lg tracking-wide font-[\'Zen\ Dots\',_cursive]">
              {card.name}
            </h3>
            <p className="text-xs opacity-90 drop-shadow-md font-semibold">{card.set.name}</p>
          </div>
          <div className="text-right ml-2">
            <div className="text-lg font-bold drop-shadow-lg bg-white/30 px-2 py-1 rounded-xl border border-white/40 inline-block">{card.cost || '-'}</div>
            <div className="text-xs opacity-90 drop-shadow-md font-semibold">{card.type}</div>
          </div>
        </div>
      </div>

      {/* Bottom Stats and Controls Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-white/30 z-20 rounded-b-2xl">
        <div className="p-3 space-y-3">
          {/* Card Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {card.attribute && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-600 font-medium">Attribute:</span>
                <span className="font-semibold text-pink-700">{card.attribute.name}</span>
              </div>
            )}
            {card.power && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-600 font-medium">Power:</span>
                <span className="font-semibold text-yellow-700">{card.power}</span>
              </div>
            )}
            {card.counter && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-600 font-medium">Counter:</span>
                <span className="font-semibold text-blue-700">{card.counter}</span>
              </div>
            )}
            {card.color && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-600 font-medium">Color:</span>
                <span className="font-semibold text-red-700">{card.color}</span>
              </div>
            )}
            {card.family && (
              <div className="flex items-center space-x-1 col-span-2">
                <span className="text-gray-600 font-medium">Family:</span>
                <span className="font-semibold text-gray-800 truncate">{card.family}</span>
              </div>
            )}
            {card.rarity && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-600 font-medium">Rarity:</span>
                <span className="font-semibold text-purple-700">{card.rarity}</span>
              </div>
            )}
          </div>

          {/* Card Ability (if exists) with popover */}
          {card.ability && (
            <div
              className="relative"
              onMouseEnter={() => setShowAbility(true)}
              onMouseLeave={() => setShowAbility(false)}
            >
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                <div className="font-medium text-blue-800 text-xs mb-1 flex items-center gap-1">
                  Ability
                  <span className="ml-1 text-blue-400">(hover to read)</span>
                </div>
                <div className="text-blue-700 text-xs leading-relaxed line-clamp-2">
                  {card.ability}
                </div>
              </div>
              {showAbility && (
                <div className="absolute left-0 top-full mt-2 w-64 z-30 p-3 bg-white/95 border border-blue-300 rounded-xl shadow-xl text-xs text-blue-900 font-medium animate-fade-in">
                  {card.ability}
                </div>
              )}
            </div>
          )}

          {/* Trigger (if exists) with popover */}
          {card.trigger && (
            <div
              className="relative"
              onMouseEnter={() => setShowTrigger(true)}
              onMouseLeave={() => setShowTrigger(false)}
            >
              <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors">
                <div className="font-medium text-yellow-800 text-xs mb-1 flex items-center gap-1">
                  Trigger
                  <span className="ml-1 text-yellow-400">(hover to read)</span>
                </div>
                <div className="text-yellow-700 text-xs leading-relaxed line-clamp-2">
                  {card.trigger}
                </div>
              </div>
              {showTrigger && (
                <div className="absolute left-0 top-full mt-2 w-64 z-30 p-3 bg-white/95 border border-yellow-300 rounded-xl shadow-xl text-xs text-yellow-900 font-medium animate-fade-in">
                  {card.trigger}
                </div>
              )}
            </div>
          )}

          {/* Collection and Deck Controls */}
          <div className="space-y-2">
            {/* Owned Quantity */}
            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-gray-700">Owned:</label>
              <select
                value={card.owned || 0}
                onChange={handleOwnedChange}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white"
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
                className={`w-full px-3 py-2 text-xs rounded-md font-bold transition-all duration-200 shadow-md border-2 border-pink-300 bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-yellow-400 hover:to-pink-500 text-white tracking-wide active:scale-95 active:shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed`}
              >
                {isInDeck ? `In Deck (${deckQuantity})` : addToDeckTitle}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 