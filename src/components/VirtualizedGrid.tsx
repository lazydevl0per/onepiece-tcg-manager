import { useMemo, useRef, useEffect, useState, useCallback } from 'react';

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  itemWidth: number;
  containerHeight: number;
  containerWidth: number;
  gap?: number;
  overscan?: number;
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  itemHeight,
  itemWidth,
  containerHeight,
  containerWidth,
  gap = 24,
  overscan = 5
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions
  const gridDimensions = useMemo(() => {
    const columns = Math.floor((containerWidth + gap) / (itemWidth + gap));
    const rows = Math.ceil(items.length / columns);
    return { columns, rows };
  }, [containerWidth, itemWidth, gap, items.length]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
    const endRow = Math.min(
      gridDimensions.rows - 1,
      Math.ceil((scrollTop + containerHeight) / (itemHeight + gap)) + overscan
    );
    
    const startIndex = startRow * gridDimensions.columns;
    const endIndex = Math.min(items.length - 1, (endRow + 1) * gridDimensions.columns - 1);
    
    return { startIndex, endIndex, startRow, endRow };
  }, [scrollTop, containerHeight, itemHeight, gap, overscan, gridDimensions, items.length]);

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Update scroll position when container changes
  useEffect(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, [containerHeight]);

  // Calculate total height
  const totalHeight = gridDimensions.rows * (itemHeight + gap) - gap;

  // Calculate offset for visible items
  const offsetY = visibleRange.startRow * (itemHeight + gap);

  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${gridDimensions.columns}, ${itemWidth}px)`,
            gap: `${gap}px`,
            padding: `${gap}px`
          }}
        >
          {items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div key={actualIndex} style={{ height: itemHeight }}>
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 