interface CostDistributionChartProps {
  costDistribution: Record<number, number>;
  maxCards: number;
}

export default function CostDistributionChart({ costDistribution, maxCards }: CostDistributionChartProps) {
  const maxValue = Math.max(...Object.values(costDistribution));
  const chartHeight = 120; // Height of the chart in pixels

  return (
    <div className="mt-4 w-full flex flex-col items-center">
      <h5 className="text-slate-300 text-sm mb-3 w-full text-left">Cost Distribution:</h5>
      <div className="flex items-end justify-center w-full max-w-2xl h-36 gap-2 px-2">
        {Array.from({ length: 10 }, (_, i) => {
          const cost = i + 1; // Start from 1
          const count = costDistribution[cost] || 0;
          const height = maxValue > 0 ? (count / maxValue) * chartHeight : 0;
          const percentage = maxCards > 0 ? (count / maxCards) * 100 : 0;

          return (
            <div key={cost} className="flex flex-col items-center flex-1 group select-none">
              {/* Bar */}
              <div className="relative flex justify-center w-full">
                <div
                  className={`w-7 sm:w-8 md:w-9 lg:w-10 rounded-t-md transition-all duration-300 shadow-md bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300 hover:from-yellow-400 hover:to-yellow-200 cursor-pointer ${count === 0 ? 'opacity-30' : ''}`}
                  style={{ height: `${height}px`, minHeight: count > 0 ? '8px' : '0px' }}
                >
                  {/* Tooltip */}
                  {count > 0 && (
                    <div className="absolute left-1/2 -top-9 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border border-slate-700">
                      <span className="font-bold">{count}</span> card{count > 1 ? 's' : ''} <span className="text-slate-400">({percentage.toFixed(1)}%)</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Cost label */}
              <div className="text-xs text-slate-400 mt-2 font-medium text-center w-full">{cost}</div>
            </div>
          );
        })}
      </div>
      {/* Chart info */}
      <div className="flex justify-between items-center mt-2 text-xs text-slate-400 w-full max-w-2xl px-2">
        <span>Total cards: {Object.values(costDistribution).reduce((sum, count) => sum + count, 0)}</span>
        <span>Max per cost: {maxValue}</span>
      </div>
    </div>
  );
} 