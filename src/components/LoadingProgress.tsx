interface LoadingProgressProps {
  progress: number;
  isLoading: boolean;
  isImageLoading?: boolean;
  imageProgress?: number;
}

export default function LoadingProgress({ 
  progress, 
  isLoading, 
  isImageLoading = false, 
  imageProgress = 0 
}: LoadingProgressProps) {
  if (!isLoading && !isImageLoading) return null;

  const percentage = Math.round(progress * 100);
  const imagePercentage = Math.round(imageProgress * 100);

  // If only image loading, show at bottom
  if (!isLoading && isImageLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800/95 backdrop-blur-sm border-t border-slate-600/50 shadow-t">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
            <span>Loading card images sequentially...</span>
            <span>{imagePercentage}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${imagePercentage}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {imagePercentage < 100 ? 'App is ready! Loading images in background...' : 'All images loaded!'}
          </div>
        </div>
      </div>
    );
  }

  // Default: show at top (for main loading)
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800/95 backdrop-blur-sm border-b border-slate-600/50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {isLoading && (
          <>
            <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
              <span>Loading One Piece TCG cards...</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {percentage < 100 ? 'Loading card data and metadata...' : 'Card data loaded! App ready to use.'}
            </div>
          </>
        )}
        {/* If both are loading, show image progress below main progress */}
        {isLoading && isImageLoading && (
          <>
            <div className="flex items-center justify-between text-sm text-slate-300 mt-4 mb-2">
              <span>Loading card images sequentially...</span>
              <span>{imagePercentage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${imagePercentage}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {imagePercentage < 100 ? 'App is ready! Loading images in background...' : 'All images loaded!'}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 