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
  searchAndFilters?: React.ReactNode;
}

export default function AppShell({
  activeTab,
  onTabChange,
  collectionCount,
  deckCount,
  children,
  searchAndFilters
}: AppShellProps) {
  // App shows immediately while data loads in background - no blocking spinner

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-slate-50 flex">
      {/* Sticky Sidebar with Tabs - full viewport height */}
      <div className="sticky top-0 h-screen w-64 bg-slate-700/50 backdrop-blur-sm border-r border-slate-600/50 flex flex-col z-40">
        <div className="p-4">
          <div className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-2 border border-slate-600/50">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => onTabChange('collection')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'collection'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                }`}
              >
                <BookOpen size={18} />
                Collection ({collectionCount})
              </button>
              <button
                onClick={() => onTabChange('deckbuilder')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'deckbuilder'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                }`}
              >
                <Layers size={18} />
                Deck Builder ({deckCount})
              </button>
            </div>
          </div>
        </div>
        {/* Storage Status in Sidebar */}
        <div className="mt-auto p-4">
          <StorageStatus />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen flex flex-col relative">
        {/* Sticky Search and Filters Bar as Header */}
        {searchAndFilters && (
          <div className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-md border-b border-slate-600/50 flex justify-center shadow-2xl">
            <div className="w-full max-w-6xl px-4 py-4">
              {searchAndFilters}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <main className="space-y-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
} 