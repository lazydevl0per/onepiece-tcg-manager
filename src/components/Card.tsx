import { type AppCard } from '../services/cardDataService';
import { getCardColorClass, getRarityColorClass, getTypeColorClass } from '../utils/constants';
import { memo, useCallback } from 'react';

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

const Card = memo(function Card({
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
  // Memoize expensive calculations
  const cardColorClass = getCardColorClass(card.color);
  const rarityColorClass = getRarityColorClass(card.rarity);
  const typeColorClass = getTypeColorClass(card.type);

  // Optimize event handlers
  const handleDecreaseOwned = useCallback(() => {
    onUpdateOwned(card.id, Math.max(0, owned - 1));
  }, [onUpdateOwned, card.id, owned]);

  const handleIncreaseOwned = useCallback(() => {
    onUpdateOwned(card.id, owned + 1);
  }, [onUpdateOwned, card.id, owned]);

  const handleAddToDeck = useCallback(() => {
    if (onAddToDeck) {
      onAddToDeck(card);
    }
  }, [onAddToDeck, card]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Try to use external image URL as fallback
    if (card.externalImageUrl && e.currentTarget.src !== card.externalImageUrl) {
      e.currentTarget.src = card.externalImageUrl;
    } else {
      // If no external URL or already tried, hide the image
      e.currentTarget.style.display = 'none';
    }
  }, [card.externalImageUrl]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.opacity = '1';
  }, []);

  return (
    <div className="bg-op-blue-deep-navy/60 backdrop-blur-sm rounded-xl p-4 border border-op-gold-primary/30 hover:border-op-gold-primary/60 transition-all shadow-lg hover:shadow-xl will-change-transform">
      {/* Card Image - Optimized loading */}
      {card.images?.small && (
        <div className="mb-3 relative">
          <img 
            src={card.images.small} 
            alt={card.name}
            className="w-full h-48 object-cover rounded-lg border border-op-gold-primary/20"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-op-blue-deep-navy/20 rounded-lg border border-op-gold-primary/20 flex items-center justify-center">
            <div className="text-op-blue-light text-sm text-center px-2">
              {card.name}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${cardColorClass} shadow-sm`}></div>
          <span className="text-sm text-op-blue-light">{card.code}</span>
        </div>
        <span className={`text-sm font-bold ${rarityColorClass}`}>
          {card.rarity}
        </span>
      </div>
      
      <h3 className="text-lg font-bold mb-2 text-op-white-pure">{card.name}</h3>
      
      <div className="flex items-center gap-4 mb-3 text-sm">
        <span className={`px-2 py-1 rounded border ${typeColorClass}`}>
          {card.type}
        </span>
        <span className="text-op-blue-light">Cost: {card.cost}</span>
        {card.power && <span className="text-op-blue-light">Power: {card.power}</span>}
        {card.counter && card.counter !== '-' && (
          <span className="text-op-gold-primary">Counter: +{card.counter}</span>
        )}
      </div>
      
      {card.ability && (
        <p className="text-sm text-op-blue-light-alt mb-3 line-clamp-3">
          {card.ability}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-op-blue-light">Owned:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDecreaseOwned}
              className="w-6 h-6 bg-op-blue-medium hover:bg-op-blue-medium-alt text-op-white-pure rounded border border-op-gold-primary/30 flex items-center justify-center text-sm"
            >
              -
            </button>
            <span className="text-sm text-op-white-pure min-w-[2rem] text-center">{owned}</span>
            <button
              onClick={handleIncreaseOwned}
              className="w-6 h-6 bg-op-gold-primary hover:bg-op-gold-secondary text-op-neutral-black rounded border border-op-gold-primary/30 flex items-center justify-center text-sm"
            >
              +
            </button>
          </div>
        </div>
        
        {canAddToDeck && onAddToDeck && (
          <button
            onClick={handleAddToDeck}
            disabled={addToDeckDisabled}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              !addToDeckDisabled
                ? 'bg-op-red-medium hover:bg-op-red-medium-alt text-op-white-cream'
                : 'bg-op-neutral-dark-gray text-op-neutral-silver cursor-not-allowed'
            }`}
            title={addToDeckTitle}
          >
            {isInDeck 
              ? `In Deck (${deckQuantity})`
              : 'Add to Deck'
            }
          </button>
        )}
      </div>
    </div>
  );
});

export default Card; 