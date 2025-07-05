import { Search, Plus, Eye, EyeOff, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
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
  // Advanced filter props
  advancedTextFilter: string;
  onAdvancedTextFilterChange: (text: string) => void;
  costFilter: string;
  onCostFilterChange: (cost: string) => void;
  powerFilter: string;
  onPowerFilterChange: (power: string) => void;
  counterFilter: string;
  onCounterFilterChange: (counter: string) => void;
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
  sets,
  // Advanced filter props
  advancedTextFilter,
  onAdvancedTextFilterChange,
  costFilter,
  onCostFilterChange,
  powerFilter,
  onPowerFilterChange,
  counterFilter,
  onCounterFilterChange
}: SearchAndFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <div className="bg-slate-700/40 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50">
      {/* Simple Search and Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 mb-3">
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

        {/* Advanced Filters Toggle - now truly inline */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600/20 hover:bg-slate-600/30 text-slate-300 rounded-lg transition-colors text-sm border border-slate-500/30 w-full h-full justify-center"
          style={{}}
        >
          <Filter size={16} />
          Advanced Filters
          {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Advanced Filters Row */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3 p-3 bg-slate-600/20 rounded-lg border border-slate-500/20">
          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1">Text Search</label>
            <input
              type="text"
              placeholder="Search in name, ability, etc..."
              value={advancedTextFilter}
              onChange={(e) => onAdvancedTextFilterChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-50 border border-slate-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1">Cost</label>
            <select
              value={costFilter}
              onChange={(e) => onCostFilterChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-50 border border-slate-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">Any Cost</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10+">10+</option>
            </select>
          </div>
          
          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1">Power</label>
            <select
              value={powerFilter}
              onChange={(e) => onPowerFilterChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-50 border border-slate-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">Any Power</option>
              <option value="1000">1000</option>
              <option value="2000">2000</option>
              <option value="3000">3000</option>
              <option value="4000">4000</option>
              <option value="5000">5000</option>
              <option value="6000">6000</option>
              <option value="7000">7000</option>
              <option value="8000">8000</option>
              <option value="9000">9000</option>
              <option value="10000">10000</option>
              <option value="10000+">10000+</option>
            </select>
          </div>
          
          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1">Counter</label>
            <select
              value={counterFilter}
              onChange={(e) => onCounterFilterChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-50 border border-slate-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">Any Counter</option>
              <option value="1000">1000</option>
              <option value="2000">2000</option>
              <option value="3000">3000</option>
              <option value="4000">4000</option>
              <option value="5000">5000</option>
              <option value="6000">6000</option>
              <option value="7000">7000</option>
              <option value="8000">8000</option>
              <option value="9000">9000</option>
              <option value="10000">10000</option>
              <option value="10000+">10000+</option>
            </select>
          </div>
        </div>
      )}

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