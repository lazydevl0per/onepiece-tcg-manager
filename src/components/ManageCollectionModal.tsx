import { useState } from 'react';
import { X, Download, Upload } from 'lucide-react';
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
  const [fileInputKey, setFileInputKey] = useState(0);

  if (!isOpen) return null;

  const handleImportCollection = (event: React.ChangeEvent<HTMLInputElement>) => {
    onImportCollection(event);
    setFileInputKey(prev => prev + 1);
  };

  const handleRestoreAllData = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRestoreAllData(event);
    setFileInputKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-700 rounded-xl p-6 w-full max-w-2xl border border-slate-500/30 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-50">Manage Your Collection</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        <p className="text-slate-300">
          Manage your card collection and backup your data.
        </p>

        {/* Collection Stats */}
        <div className="bg-slate-600/10 p-4 rounded-lg border border-slate-500/20 mt-4">
          <h4 className="font-semibold text-slate-50 mb-2">Collection Stats</h4>
          <p className="text-sm text-slate-300">Total Cards: {totalCards}</p>
          <p className="text-sm text-slate-300">Owned Cards: {ownedCards}</p>
          <p className="text-sm text-slate-300">Total Copies: {totalCopies}</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-600/10 p-4 rounded-lg border border-slate-500/20 mt-4">
          <h4 className="font-semibold text-slate-50 mb-2">Quick Actions</h4>
          <button
            onClick={onClearAllCollections}
            className="block w-full text-left text-sm text-red-400 hover:text-red-300 mb-1"
          >
            Clear all collections (set all cards to 0)
          </button>
          <button
            onClick={onSetAllToOne}
            className="block w-full text-left text-sm text-yellow-400 hover:text-yellow-300 mb-1"
          >
            Set all cards to 1 copy
          </button>
          <button
            onClick={onExportCollection}
            className="block w-full text-left text-sm text-blue-400 hover:text-blue-300 mb-1"
          >
            Export collection data
          </button>
          <label className="block w-full text-left text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
            <Upload size={14} className="inline mr-1" />
            Import collection data
            <input
              key={fileInputKey}
              type="file"
              accept=".json"
              onChange={handleImportCollection}
              className="hidden"
            />
          </label>
        </div>

        {/* Backup & Restore */}
        <div className="bg-slate-600/10 p-4 rounded-lg border border-slate-500/20 mt-4">
          <h4 className="font-semibold text-slate-50 mb-2">Backup & Restore</h4>
          <p className="text-sm text-slate-300 mb-3">
            Backup includes all your collections and deck data. Restore will replace all current data.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onBackupAllData}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-slate-900 py-2 rounded-lg transition-colors font-semibold"
            >
              <Download size={16} className="inline mr-1" />
              Backup All Data
            </button>
            <label className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors font-semibold cursor-pointer text-center">
              <Upload size={16} className="inline mr-1" />
              Restore All Data
              <input
                key={fileInputKey + 'backup'}
                type="file"
                accept=".json"
                onChange={handleRestoreAllData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="mt-4">
          <StorageStatus />
        </div>
      </div>
    </div>
  );
} 