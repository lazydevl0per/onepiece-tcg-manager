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
    <>
      <div
        className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 bg-white/20 border-2 border-white/30 hover:scale-105 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:border-pink-400 group cursor-pointer"
        style={{ boxShadow: '0 4px 32px 0 rgba(31,38,135,0.37)' }}
        onClick={handleCardClick}
      >
        {/* Sparkle overlay for anime effect (only if not owned) */}
        {!(card.owned > 0) && (
          <div className="pointer-events-none absolute inset-0 z-10 animate-pulse bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15)_0%,transparent_70%)]" />
        )}

        {/* Card Image Background with anime border */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat border-4 border-transparent group-hover:border-pink-300 rounded-2xl"
          style={{
            backgroundImage: `url(${getImagePath(card.id)})`,
            filter: !(card.owned > 0) ? 'brightness(0.95) saturate(1.15) blur(6px)' : 'brightness(0.98) saturate(1.10)',
            transition: 'filter 0.3s',
          }}
        />

        {/* Glassmorphism overlay (only if not owned) */}
        {!(card.owned > 0) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-white/10 to-transparent backdrop-blur-[6px]" />
        )}

        {/* Rarity Badge */}
        <div className={`absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${rarityGradient} border-2 border-white/40 drop-shadow-md backdrop-blur-sm bg-opacity-90`}
          style={{maxWidth: '60%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {card.rarity}
        </div>
        
        {/* Type Badge */}
        <div className={`absolute top-3 right-3 z-20 px-2 py-1 rounded-full text-xs font-bold text-white shadow bg-opacity-90 ${typeColor} border-2 border-white/40 backdrop-blur-sm`}
          style={{maxWidth: '40%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {card.type}
        </div>

        {/* Top Card Info */}
        <div className="absolute top-0 left-0 right-0 p-3 z-20 flex flex-col gap-1 pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-lg leading-tight truncate drop-shadow-lg tracking-wide font-['Zen Dots',_cursive] bg-black/60 px-2 py-1 rounded text-white" style={{maxWidth: '90%'}}>
                {card.name}
              </h3>
              <p className="text-xs opacity-90 drop-shadow-md font-semibold bg-black/40 px-2 py-0.5 rounded text-white mt-1 max-w-full truncate">{card.set.name}</p>
            </div>
            <div className="text-right ml-2">
              <div className="text-lg font-bold drop-shadow-lg bg-white/70 px-2 py-1 rounded-xl border border-white/40 inline-block text-gray-900">
                {card.cost || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls Panel - Improved clarity */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/30 z-20 rounded-b-2xl">
          <div className="p-3">
            {/* Quick Stats */}
            <div className="flex justify-between items-center mb-3">
              {card.power && (
                <div className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  <span className="font-medium">Power:</span> {card.power}
                </div>
              )}
              {card.attribute && (
                <div className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  <span className="font-medium">Attr:</span> {card.attribute.name}
                </div>
              )}
            </div>

            {/* Collection and Deck Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-2 md:space-y-0">
              {/* Owned Quantity */}
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <label className="text-xs font-semibold text-gray-700 bg-white/60 px-2 py-1 rounded-lg shadow-sm" style={{minWidth: '52px'}}>Owned:</label>
                <select
                  value={card.owned || 0}
                  onChange={handleOwnedChange}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-2 py-1 text-xs rounded-lg border border-pink-300 bg-white/70 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-150 backdrop-blur-sm"
                  style={{minWidth: '48px'}}
                >
                  {Array.from({ length: MAX_COPIES_PER_CARD + 1 }, (_, i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              {/* Add to Deck Button */}
              {canAddToDeck && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToDeck();
                  }}
                  disabled={isInDeck || addToDeckDisabled}
                  title={addToDeckTitle}
                  className={`flex-1 w-full md:w-auto px-3 py-2 text-xs rounded-lg font-bold transition-all duration-200 shadow-lg border-2 border-pink-400 bg-gradient-to-r from-pink-500/90 to-yellow-400/90 hover:from-yellow-400 hover:to-pink-500 text-white tracking-wide active:scale-95 active:shadow-xl disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed backdrop-blur-sm`}
                  style={{minWidth: '120px'}}
                >
                  {isInDeck ? `In Deck (${deckQuantity})` : addToDeckTitle}
                </button>
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