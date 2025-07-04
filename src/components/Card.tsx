import React, { useState } from 'react';
import { AppCard } from '../services/cardDataService';
import CardDetails from './CardDetails';

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
  const [showDetails, setShowDetails] = useState(false);

  const handleOwnedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newOwned = parseInt(event.target.value);
    onUpdateOwned?.(card.id, newOwned);
  };

  const handleAddToDeck = () => {
    onAddToDeck?.(card);
  };

  const handleCardClick = () => {
    setShowDetails(true);
  };

  // Generate image path based on card ID
  const getImagePath = (cardId: string) => {
    return `./data/english/images/${cardId}.webp`;
  };

  // MMORPG-style rarity color map
  const mmorpgRarityColors: Record<string, string> = {
    'Common': 'from-gray-400 to-gray-500', // gray
    'Uncommon': 'from-green-500 to-green-400', // green
    'Rare': 'from-blue-500 to-blue-400', // blue
    'SuperRare': 'from-purple-600 to-purple-400', // purple (epic)
    'Epic': 'from-purple-600 to-purple-400', // alias for epic
    'SecretRare': 'from-yellow-500 to-yellow-400', // gold/orange (legendary)
    'Legendary': 'from-yellow-500 to-yellow-400', // alias for legendary
    'Promo': 'from-pink-500 to-pink-400', // pink (special)
    'Leader': 'from-red-600 to-red-400', // red for leader
  };
  const rarityKey = (card.rarity || '').trim();
  const rarityGradient = mmorpgRarityColors[rarityKey] || 'from-gray-400 to-gray-500';

  // Type badge color using One Piece TCG colors
  const typeColors: Record<string, string> = {
    'Character': 'bg-[var(--op-blue-medium)]',
    'Leader': 'bg-[var(--op-red-deep-crimson)]',
    'Event': 'bg-[var(--op-gold-primary)]',
    'Stage': 'bg-[var(--op-neutral-dark-gray)]',
  };
  const typeColor = typeColors[card.type] || 'bg-[var(--op-neutral-silver)]';

  return (
    <>
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 bg-white/20 border-2 border-white/30 hover:scale-105 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:border-pink-400 group cursor-pointer w-full aspect-[5/7] max-w-md"
        style={{ boxShadow: '0 4px 32px 0 rgba(31,38,135,0.37)' }}
        onClick={handleCardClick}
      >
        {/* Sparkle overlay for anime effect (only if not owned) */}
        {!(card.owned > 0) && (
          <div className="pointer-events-none absolute inset-0 z-10 animate-pulse bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15)_0%,transparent_70%)]" />
        )}

        {/* Card Image Background with anime border */}
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat border-4 border-transparent group-hover:border-pink-300 rounded-2xl"
          style={{
            backgroundImage: `url(${getImagePath(card.id)})`,
            backgroundColor: '#fff',
            filter: !(card.owned > 0) ? 'brightness(0.95) saturate(1.15) blur(6px)' : 'brightness(0.98) saturate(1.10)',
            transition: 'filter 0.3s',
          }}
        />

        {/* Glassmorphism overlay (only if not owned) */}
        {!(card.owned > 0) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-white/10 to-transparent backdrop-blur-[6px]" />
        )}

        {/* Top Card Info */}
        <div className="absolute top-0 left-0 right-0 p-3 z-20 flex flex-col gap-1 pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-lg leading-tight truncate drop-shadow-lg tracking-wide font-['Zen Dots',_cursive] bg-black/60 px-2 py-1 rounded text-white" style={{maxWidth: '90%'}}>
                {card.name}
              </h3>
              <p className="text-xs opacity-90 drop-shadow-md font-semibold bg-black/40 px-2 py-0.5 rounded text-white mt-1 max-w-full truncate">{card.set.name}</p>
              {/* Badges row: type first, then rarity */}
              <div className="flex flex-row gap-2 items-center mt-1">
                {(() => {
                  const colorMap = {
                    RED: 'bg-red-500 text-white',
                    BLUE: 'bg-blue-500 text-white',
                    GREEN: 'bg-green-500 text-white',
                    PURPLE: 'bg-purple-500 text-white',
                    BLACK: 'bg-gray-800 text-white',
                    YELLOW: 'bg-yellow-400 text-gray-900',
                  } as const;
                  const colorKey = (card.color?.toUpperCase?.() || '') as keyof typeof colorMap;
                  const colorClass = colorMap[colorKey] || 'bg-gray-400 text-white';
                  return (
                    <div className={`px-2 py-1 rounded-full text-xs font-bold shadow border border-white/40 inline-block ${colorClass}`} style={{maxWidth: '40%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {card.type.charAt(0).toUpperCase() + card.type.slice(1).toLowerCase()}
                    </div>
                  );
                })()}
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${rarityGradient} border-2 border-white/40 drop-shadow-md backdrop-blur-sm bg-opacity-90`} style={{maxWidth: '60%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {card.rarity}
                </div>
              </div>
            </div>
            {/* Cost/Life Badge with card color scheme */}
            <div className="text-right ml-2">
              {(() => {
                const colorMap = {
                  RED: 'bg-red-500 text-white',
                  BLUE: 'bg-blue-500 text-white',
                  GREEN: 'bg-green-500 text-white',
                  PURPLE: 'bg-purple-500 text-white',
                  BLACK: 'bg-gray-800 text-white',
                  YELLOW: 'bg-yellow-400 text-gray-900',
                } as const;
                const colorKey = (card.color?.toUpperCase?.() || '') as keyof typeof colorMap;
                const colorClass = colorMap[colorKey] || 'bg-gray-400 text-white';
                return (
                  <div className={`text-lg font-bold drop-shadow-lg px-2 py-1 rounded-xl border border-white/40 inline-block ${colorClass}`}>
                    {card.cost || '-'}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Bottom Controls Panel - Improved clarity */}
        <div className="absolute left-3 right-3 bottom-3 bg-slate-800/95 z-20 rounded-2xl shadow-2xl flex flex-col" style={{backdropFilter: 'blur(2px)'}}>
          <div className="p-3">
            {/* Quick Stats removed as requested */}

            {/* Collection and Deck Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-2 md:space-y-0">
              {/* Owned Quantity */}
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <button
                  className="w-7 h-7 rounded bg-red-500 hover:bg-red-600 text-white text-base font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateOwned && onUpdateOwned(card.id, Math.max(0, (card.owned || 0) - 1));
                  }}
                  disabled={!onUpdateOwned || (card.owned || 0) <= 0}
                  type="button"
                  tabIndex={-1}
                >
                  <span className="text-white">-</span>
                </button>
                <span className="text-base font-semibold w-8 text-center text-white select-none">{card.owned || 0}</span>
                <button
                  className="w-7 h-7 rounded bg-green-500 hover:bg-green-600 text-white text-base font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateOwned && onUpdateOwned(card.id, (card.owned || 0) + 1);
                  }}
                  disabled={!onUpdateOwned}
                  type="button"
                  tabIndex={-1}
                >
                  <span className="text-white">+</span>
                </button>
              </div>

              {/* Add to Deck Button */}
              {canAddToDeck && (
                <div style={{flexBasis: '120px', minWidth: '100px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {card.owned > 0 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToDeck();
                      }}
                      disabled={isInDeck || addToDeckDisabled}
                      title={addToDeckTitle}
                      className={`w-full px-3 py-2 text-xs rounded-lg font-bold transition-colors shadow-lg bg-yellow-500 hover:bg-yellow-600 text-slate-900 tracking-wide disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed`}
                      style={{height: '40px'}}
                    >
                      {isInDeck ? `In Deck (${deckQuantity})` : addToDeckTitle}
                    </button>
                  ) : (
                    <span style={{width: '100%', height: '40px', display: 'inline-block'}} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Click hint overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
          <div className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            Click for details
          </div>
        </div>
      </div>

      {/* Card Details Modal */}
      <CardDetails
        card={card}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onUpdateOwned={onUpdateOwned}
        onAddToDeck={onAddToDeck}
        isInDeck={isInDeck}
        deckQuantity={deckQuantity}
        MAX_COPIES_PER_CARD={MAX_COPIES_PER_CARD}
        canAddToDeck={canAddToDeck}
        addToDeckDisabled={addToDeckDisabled}
        addToDeckTitle={addToDeckTitle}
      />
    </>
  );
} 