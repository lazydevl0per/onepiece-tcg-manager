import { Search, Plus, Eye, EyeOff } from 'lucide-react';
import { type SetInfo } from '../services/cardDataService';
import { normalizeRarity, formatRarity } from '../utils/constants';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  colorFilter: string;
  onColorFilterChange: (color: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  rarityFilter: string;
  onRarityFilterChange: (rarity: string) => void;
  setFilter: string;
  onSetFilterChange: (set: string) => void;
  showOwnedOnly: boolean;
  onShowOwnedOnlyChange: (show: boolean) => void;
  onShowManageCollection: () => void;
  filteredCardsCount: number;
  totalCardsCount: number;
  ownedCardsCount: number;
  colors: string[];
  types: string[];
  rarities: string[];
  sets: SetInfo[];
}

// Helper to format type for display
const formatType = (type: string) => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

export default function SearchAndFilters({
  searchTerm,
  onSearchChange,
  colorFilter,
  onColorFilterChange,
  typeFilter,
  onTypeFilterChange,
  rarityFilter,
  onRarityFilterChange,
  setFilter,
  onSetFilterChange,
  showOwnedOnly,
  onShowOwnedOnlyChange,
  onShowManageCollection,
  filteredCardsCount,
  totalCardsCount,
  ownedCardsCount,
  colors,
  types,
  rarities,
  sets
}: SearchAndFiltersProps) {
  return (
    <div className="bg-slate-700/40 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50">
      {/* Search and Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-3">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search cards by name, ability, or code..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-600/20 border border-slate-500/30 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        
        <select
          value={colorFilter}
          onChange={(e) => onColorFilterChange(e.target.value)}
          className="px-3 py-2 bg-slate-700 text-slate-50 border border-slate-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="all">All Colors</option>
          {colors.map(color => (
            <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="px-3 py-2 bg-slate-700 text-slate-50 border border-slate-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="all">All Types</option>
          {types.map(type => (
            <option key={type} value={type}>{formatType(type)}</option>
          ))}
        </select>

        <select
          value={normalizeRarity(rarityFilter)}
          onChange={(e) => onRarityFilterChange(e.target.value)}
          className="px-3 py-2 bg-slate-700 text-slate-50 border border-slate-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="all">All Rarities</option>
          {rarities.map(rarity => (
            <option key={normalizeRarity(rarity)} value={normalizeRarity(rarity)}>{formatRarity(rarity)}</option>
          ))}
        </select>

        <select
          value={setFilter}
          onChange={(e) => onSetFilterChange(e.target.value)}
          className="px-3 py-2 bg-slate-700 text-slate-50 border border-slate-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="all">All Sets</option>
          {sets.map(set => (
            <option key={set.id} value={set.id}>{set.code} - {set.name}</option>
          ))}
        </select>
      </div>

      {/* Stats and Actions Row */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <p className="text-slate-300 text-sm">
            {filteredCardsCount} cards found
          </p>
          <button
            onClick={() => onShowOwnedOnlyChange(!showOwnedOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
              showOwnedOnly 
                ? 'bg-yellow-500 text-slate-900' 
                : 'bg-slate-600/20 text-slate-300 hover:bg-slate-600/30'
            }`}
          >
            {showOwnedOnly ? <EyeOff size={14} /> : <Eye size={14} />}
            {showOwnedOnly ? 'Show All' : 'Owned Only'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-300">
            Collection: {ownedCardsCount}/{totalCardsCount} cards
          </div>
          <button
            onClick={onShowManageCollection}
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors font-semibold text-sm"
          >
            <Plus size={16} />
            Manage Collection
          </button>
        </div>
      </div>
    </div>
  );
} 