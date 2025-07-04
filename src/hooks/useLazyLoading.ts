import { useState, useEffect, useCallback, useRef } from 'react';
import { AppCard } from '../services/cardDataService';

interface UseLazyLoadingProps {
  allCards: AppCard[];
  initialLoadCount?: number;
  loadMoreCount?: number;
  threshold?: number; // Distance from bottom to trigger load more
}

export function useLazyLoading({
  allCards,
  initialLoadCount = 50,
  loadMoreCount = 50,
  threshold = 100
}: UseLazyLoadingProps) {
  const [displayedCards, setDisplayedCards] = useState<AppCard[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingTriggerRef = useRef<HTMLDivElement | null>(null);
  const lastAllCardsRef = useRef<AppCard[]>([]);

  // Reset displayed cards when allCards actually changes (not just reference)
  useEffect(() => {
    // Check if the cards array has actually changed by comparing IDs and owned counts
    const currentCardKey = allCards.map(card => `${card.id}:${card.owned}`).join(',');
    const lastCardKey = lastAllCardsRef.current.map(card => `${card.id}:${card.owned}`).join(',');
    
    if (currentCardKey !== lastCardKey) {
      const initialCards = allCards.slice(0, initialLoadCount);
      setDisplayedCards(initialCards);
      setHasMore(allCards.length > initialLoadCount);
      lastAllCardsRef.current = allCards;
    }
  }, [allCards, initialLoadCount]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      const currentCount = displayedCards.length;
      const newCards = allCards.slice(currentCount, currentCount + loadMoreCount);
      
      setDisplayedCards(prev => [...prev, ...newCards]);
      setHasMore(currentCount + loadMoreCount < allCards.length);
      setIsLoadingMore(false);
    }, 100);
  }, [displayedCards.length, allCards, loadMoreCount, hasMore, isLoadingMore]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!loadingTriggerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    observerRef.current.observe(loadingTriggerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loadMore, threshold]);

  const reset = useCallback(() => {
    const initialCards = allCards.slice(0, initialLoadCount);
    setDisplayedCards(initialCards);
    setHasMore(allCards.length > initialLoadCount);
    setIsLoadingMore(false);
    lastAllCardsRef.current = allCards;
  }, [allCards, initialLoadCount]);

  return {
    displayedCards,
    hasMore,
    isLoadingMore,
    loadMore,
    reset,
    loadingTriggerRef
  };
} 