import StorageStatus from './StorageStatus';

interface ManageCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllCollections: () => void;
  onSetAllToOne: () => void;
  onExportCollection: () => void;
  onImportCollection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBackupAllData: () => void;
  onRestoreAllData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalCards: number;
  ownedCards: number;
  totalCopies: number;
}

export default function ManageCollectionModal({
  isOpen,
  onClose,
  onClearAllCollections,
  onSetAllToOne,
  onExportCollection,
  onImportCollection,
  onBackupAllData,
  onRestoreAllData,
  totalCards,
  ownedCards,
  totalCopies
}: ManageCollectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-op-neutral-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-op-blue-deep-navy rounded-xl p-6 w-full max-w-2xl border border-op-gold-primary/30 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-op-white-pure">Manage Your Collection</h3>
        
        <div className="space-y-4">
          <p className="text-op-blue-light">
            Use the + and - buttons on each card to adjust your collection. 
            Cards with 0 copies will be hidden when "Owned Only" is enabled.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-op-blue-medium/10 p-4 rounded-lg border border-op-gold-primary/20">
              <h4 className="font-semibold text-op-white-pure mb-2">Collection Stats</h4>
              <p className="text-sm text-op-blue-light">Total Cards: {totalCards}</p>
              <p className="text-sm text-op-blue-light">Owned Cards: {ownedCards}</p>
              <p className="text-sm text-op-blue-light">Total Copies: {totalCopies}</p>
            </div>
            
            <div className="bg-op-blue-medium/10 p-4 rounded-lg border border-op-gold-primary/20">
              <h4 className="font-semibold text-op-white-pure mb-2">Quick Actions</h4>
              <button
                onClick={onClearAllCollections}
                className="block w-full text-left text-sm text-op-red-bright hover:text-op-red-medium mb-1"
              >
                Clear All Collections
              </button>
              <button
                onClick={onSetAllToOne}
                className="block w-full text-left text-sm text-op-gold-primary hover:text-op-gold-secondary mb-1"
              >
                Set All to 1 Copy
              </button>
              <button
                onClick={onExportCollection}
                className="block w-full text-left text-sm text-op-blue-light hover:text-op-blue-bright mb-1"
              >
                Export Collection
              </button>
              <label className="block w-full text-left text-sm text-op-blue-light hover:text-op-blue-bright cursor-pointer">
                Import Collection
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportCollection}
                  className="hidden"
                />
              </label>
            </div>

            <div className="bg-op-blue-medium/10 p-4 rounded-lg border border-op-gold-primary/20">
              <h4 className="font-semibold text-op-white-pure mb-2">Backup & Restore</h4>
              <button
                onClick={onBackupAllData}
                className="block w-full text-left text-sm text-op-green-bright hover:text-op-green-medium mb-1"
              >
                Backup All Data
              </button>
              <label className="block w-full text-left text-sm text-op-green-bright hover:text-op-green-medium cursor-pointer">
                Restore All Data
                <input
                  type="file"
                  accept=".json"
                  onChange={onRestoreAllData}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="mt-4">
            <StorageStatus />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-op-gold-primary hover:bg-op-gold-secondary text-op-neutral-black py-2 rounded-lg transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 