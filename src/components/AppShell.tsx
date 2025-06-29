import { ReactNode } from 'react';
import { BookOpen, Layers } from 'lucide-react';

interface AppShellProps {
  activeTab: 'collection' | 'deckbuilder';
  onTabChange: (tab: 'collection' | 'deckbuilder') => void;
  isLoading: boolean;
  collectionCount: number;
  deckCount: number;
  children: ReactNode;
}

export default function AppShell({
  activeTab,
  onTabChange,
  isLoading,
  collectionCount,
  deckCount,
  children
}: AppShellProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-op-gold-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-op-white-pure mb-2">Loading One Piece TCG Manager</h2>
          <p className="text-op-blue-light">Loading card data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-op-blue-deep-navy via-op-blue-medium to-op-blue-light text-op-white-pure">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-op-gold-primary to-op-gold-metallic bg-clip-text text-transparent">
            One Piece TCG Manager
          </h1>
          <p className="text-op-blue-light-alt">Build your collection and create powerful decks!</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-op-neutral-black/30 rounded-lg p-1 backdrop-blur-sm border border-op-gold-primary/20">
            <button
              onClick={() => onTabChange('collection')}
              className={`px-6 py-3 rounded-md transition-all flex items-center gap-2 ${
                activeTab === 'collection'
                  ? 'bg-op-blue-medium hover:bg-op-blue-medium-alt text-op-white-pure shadow-lg border border-op-gold-primary/30'
                  : 'text-op-blue-light hover:text-op-white-pure hover:bg-op-blue-medium/20'
              }`}
            >
              <BookOpen size={20} />
              Collection ({collectionCount})
            </button>
            <button
              onClick={() => onTabChange('deckbuilder')}
              className={`px-6 py-3 rounded-md transition-all flex items-center gap-2 ${
                activeTab === 'deckbuilder'
                  ? 'bg-op-red-medium hover:bg-op-red-medium-alt text-op-white-cream shadow-lg border border-op-gold-primary/30'
                  : 'text-op-red-bright hover:text-op-white-cream hover:bg-op-red-medium/20'
              }`}
            >
              <Layers size={20} />
              Deck Builder ({deckCount})
            </button>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
} 