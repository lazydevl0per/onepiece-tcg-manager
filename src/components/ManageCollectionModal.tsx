interface ManageCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllCollections: () => void;
  onSetAllToOne: () => void;
  totalCards: number;
  ownedCards: number;
  totalCopies: number;
}

export default function ManageCollectionModal({
  isOpen,
  onClose,
  onClearAllCollections,
  onSetAllToOne,
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="block w-full text-left text-sm text-op-gold-primary hover:text-op-gold-secondary"
              >
                Set All to 1 Copy
              </button>
            </div>
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