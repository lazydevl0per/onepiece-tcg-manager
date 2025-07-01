import { type AppCard } from './cardDataService';
import { type Deck } from '../hooks/useDeckBuilder';

// Storage keys
const COLLECTION_STORAGE_KEY = 'onepiece-tcg-collection';
const DECKS_STORAGE_KEY = 'onepiece-tcg-decks';

// Collection storage interface
export interface CollectionData {
  cards: { [cardId: string]: number }; // cardId -> owned quantity
  lastUpdated: string;
}

// Deck storage interface
export interface DeckData {
  decks: Deck[];
  selectedDeckId: string | null;
}

export class StorageService {
  // Collection persistence
  static saveCollection(cards: AppCard[]): void {
    try {
      const collectionData: CollectionData = {
        cards: cards.reduce((acc, card) => {
          if (card.owned > 0) {
            acc[card.id] = card.owned;
          }
          return acc;
        }, {} as { [cardId: string]: number }),
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collectionData));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save collection to localStorage:', error);
    }
  }

  static loadCollection(): CollectionData | null {
    try {
      const stored = localStorage.getItem(COLLECTION_STORAGE_KEY);
      if (!stored) return null;
      
      const collectionData: CollectionData = JSON.parse(stored);
      
      // Validate the data structure
      if (!collectionData.cards || typeof collectionData.cards !== 'object') {
        // eslint-disable-next-line no-console
        console.warn('Invalid collection data structure, clearing storage');
        localStorage.removeItem(COLLECTION_STORAGE_KEY);
        return null;
      }
      
      return collectionData;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load collection from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(COLLECTION_STORAGE_KEY);
      return null;
    }
  }

  static clearCollection(): void {
    localStorage.removeItem(COLLECTION_STORAGE_KEY);
  }

  // Deck persistence
  static saveDecks(decks: Deck[], selectedDeckId: string | null): void {
    try {
      const deckData: DeckData = {
        decks: decks.map(deck => ({
          ...deck,
          createdAt: new Date(deck.createdAt),
          updatedAt: new Date(deck.updatedAt)
        })),
        selectedDeckId
      };
      
      localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(deckData));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save decks to localStorage:', error);
    }
  }

  static loadDecks(): DeckData | null {
    try {
      const stored = localStorage.getItem(DECKS_STORAGE_KEY);
      if (!stored) return null;
      
      const deckData: DeckData = JSON.parse(stored);
      
      // Validate the data structure
      if (!deckData.decks || !Array.isArray(deckData.decks)) {
        // eslint-disable-next-line no-console
        console.warn('Invalid deck data structure, clearing storage');
        localStorage.removeItem(DECKS_STORAGE_KEY);
        return null;
      }
      
      // Convert date strings back to Date objects
      deckData.decks = deckData.decks.map(deck => ({
        ...deck,
        createdAt: new Date(deck.createdAt),
        updatedAt: new Date(deck.updatedAt)
      }));
      
      return deckData;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load decks from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(DECKS_STORAGE_KEY);
      return null;
    }
  }

  static clearDecks(): void {
    localStorage.removeItem(DECKS_STORAGE_KEY);
  }

  // Clear all app data
  static clearAllData(): void {
    this.clearCollection();
    this.clearDecks();
  }

  // Get storage usage info
  static getStorageInfo(): { collectionSize: number; decksSize: number; totalSize: number } {
    const collectionData = localStorage.getItem(COLLECTION_STORAGE_KEY);
    const decksData = localStorage.getItem(DECKS_STORAGE_KEY);
    
    const collectionSize = collectionData ? new Blob([collectionData]).size : 0;
    const decksSize = decksData ? new Blob([decksData]).size : 0;
    const totalSize = collectionSize + decksSize;
    
    return { collectionSize, decksSize, totalSize };
  }

  // Backup all data
  static backupData(): string {
    const collectionData = localStorage.getItem(COLLECTION_STORAGE_KEY);
    const decksData = localStorage.getItem(DECKS_STORAGE_KEY);
    
    const backup = {
      collection: collectionData ? JSON.parse(collectionData) : null,
      decks: decksData ? JSON.parse(decksData) : null,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(backup, null, 2);
  }

  // Restore data from backup
  static restoreData(backupJson: string): boolean {
    try {
      const backup = JSON.parse(backupJson);
      
      if (backup.collection) {
        localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(backup.collection));
      }
      
      if (backup.decks) {
        localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(backup.decks));
      }
      
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to restore data from backup:', error);
      return false;
    }
  }

  // Export collection data
  static exportCollection(cards: AppCard[]): string {
    const collectionData = cards.reduce((acc, card) => {
      if (card.owned > 0) {
        acc[card.id] = {
          name: card.name,
          owned: card.owned,
          set: card.set.name,
          rarity: card.rarity
        };
      }
      return acc;
    }, {} as Record<string, { name: string; owned: number; set: string; rarity: string }>);
    
    return JSON.stringify(collectionData, null, 2);
  }

  // Import collection data
  static importCollection(cards: AppCard[], importData: string): AppCard[] {
    try {
      const importedData = JSON.parse(importData);
      
      return cards.map(card => ({
        ...card,
        owned: importedData[card.id]?.owned || card.owned
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to import collection data:', error);
      return cards;
    }
  }
} 