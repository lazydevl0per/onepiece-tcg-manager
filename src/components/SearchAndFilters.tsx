import { Search, Plus, Eye, EyeOff } from 'lucide-react';
import { type SetInfo } from '../services/cardDataService';

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
    <div className="bg-op-blue-deep-navy/40 backdrop-blur-sm rounded-xl p-6 mb-6 border border-op-gold-primary/20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-op-blue-light" size={20} />
            <input
              type="text"
              placeholder="Search cards by name, ability, or code..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-op-blue-medium/20 border border-op-gold-primary/30 rounded-lg text-op-white-pure placeholder-op-blue-light focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
            />
          </div>
        </div>
        
        <select
          value={colorFilter}
          onChange={(e) => onColorFilterChange(e.target.value)}
          className="px-3 py-2 bg-op-blue-deep-navy text-op-white-pure border border-op-gold-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
        >
          <option value="all">All Colors</option>
          {colors.map(color => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="px-3 py-2 bg-op-blue-deep-navy text-op-white-pure border border-op-gold-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
        >
          <option value="all">All Types</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={rarityFilter}
          onChange={(e) => onRarityFilterChange(e.target.value)}
          className="px-3 py-2 bg-op-blue-deep-navy text-op-white-pure border border-op-gold-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
        >
          <option value="all">All Rarities</option>
          {rarities.map(rarity => (
            <option key={rarity} value={rarity}>{rarity}</option>
          ))}
        </select>

        <select
          value={setFilter}
          onChange={(e) => onSetFilterChange(e.target.value)}
          className="px-3 py-2 bg-op-blue-deep-navy text-op-white-pure border border-op-gold-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-op-gold-primary"
        >
          <option value="all">All Sets</option>
          {sets.map(set => (
            <option key={set.code} value={set.code}>{set.code} - {set.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <p className="text-op-blue-light">
            {filteredCardsCount} cards found
          </p>
          <button
            onClick={() => onShowOwnedOnlyChange(!showOwnedOnly)}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
              showOwnedOnly 
                ? 'bg-op-gold-primary text-op-neutral-black' 
                : 'bg-op-blue-medium/20 text-op-blue-light hover:bg-op-blue-medium/30'
            }`}
          >
            {showOwnedOnly ? <EyeOff size={16} /> : <Eye size={16} />}
            {showOwnedOnly ? 'Show All' : 'Owned Only'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-op-blue-light">
            Collection: {ownedCardsCount}/{totalCardsCount} cards
          </div>
          <button
            onClick={onShowManageCollection}
            className="bg-op-gold-primary hover:bg-op-gold-secondary text-op-neutral-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-semibold"
          >
            <Plus size={20} />
            Manage Collection
          </button>
        </div>
      </div>
    </div>
  );
} 