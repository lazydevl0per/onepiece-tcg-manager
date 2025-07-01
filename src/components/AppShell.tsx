import { BookOpen, Layers } from 'lucide-react';
import StorageStatus from './StorageStatus';

interface AppShellProps {
  activeTab: 'collection' | 'deckbuilder';
  onTabChange: (tab: 'collection' | 'deckbuilder') => void;
  isLoading: boolean;
  isImageLoading?: boolean;
  collectionCount: number;
  deckCount: number;
  children: React.ReactNode;
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-slate-50 mb-2">Loading One Piece TCG Manager</h2>
          <p className="text-slate-300">Loading card data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-slate-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            One Piece TCG Manager
          </h1>
          <p className="text-slate-300">Build your collection and create powerful decks!</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-2 border border-slate-600/50">
            <div className="flex space-x-2">
              <button
                onClick={() => onTabChange('collection')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'collection'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                }`}
              >
                <BookOpen size={20} />
                Collection ({collectionCount})
              </button>
              <button
                onClick={() => onTabChange('deckbuilder')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'deckbuilder'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                }`}
              >
                <Layers size={20} />
                Deck Builder ({deckCount})
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="space-y-6">
          {children}
        </main>

        {/* Footer with Storage Status */}
        <div className="mt-12">
          <StorageStatus />
        </div>
      </div>
    </div>
  );
} 