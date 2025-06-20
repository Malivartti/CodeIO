import React, { useEffect, useRef, useState } from 'react';

interface ResizableSplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth: number;
  onLeftWidthChange: (value: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

const ResizableSplitPane: React.FC<ResizableSplitPaneProps> = ({
  left,
  right,
  leftWidth,
  onLeftWidthChange,
  minWidth = 20,
  maxWidth = 80,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    setIsDragging(true);
    e.preventDefault();
  };

  const stopResizing = () => {
    setIsResizing(false);
    setIsDragging(false);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      const clampedWidth = Math.min(maxWidth, Math.max(minWidth, newLeftWidth));
      onLeftWidthChange(clampedWidth);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsResizing(true);
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isResizing && containerRef.current) {
      const touch = e.touches[0];
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((touch.clientX - containerRect.left) / containerRect.width) * 100;

      const clampedWidth = Math.min(maxWidth, Math.max(minWidth, newLeftWidth));
      onLeftWidthChange(clampedWidth);
    }
  };

  const handleTouchEnd = () => {
    setIsResizing(false);
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => resize(e);
    const handleMouseUp = () => stopResizing();

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isResizing]);

  return (
    <div
      ref={containerRef}
      className="flex w-full h-[calc(100vh-56px)] relative"
    >
      <div
        className="h-full overflow-auto border-r border-surface"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>

      <button
        className={`w-1 md:w-2 cursor-col-resize group bg-surface hover:bg-surface-hover border-l border-r border-surface flex items-center justify-center relative transition-all duration-200 ${
          isDragging ? 'bg-brand shadow-lg' : ''
        }`}
        onMouseDown={startResizing}
        onTouchStart={handleTouchStart}
        aria-label="Изменение размера секций"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const step = e.shiftKey ? 5 : 1;
            const direction = e.key === 'ArrowLeft' ? -step : step;
            const newWidth = Math.min(maxWidth, Math.max(minWidth, leftWidth + direction));
            onLeftWidthChange(newWidth);
          }
        }}
        onFocus={(e) => e.currentTarget.blur()}
      >
        <div className={`w-0.5 md:w-1 h-8 md:h-10 rounded-full transition-all duration-200 ${
          isDragging
            ? 'bg-brand-light scale-110'
            : 'bg-brand group-hover:bg-brand-hover group-focus:bg-brand-hover'
        }`} />

        <div className="absolute inset-0 md:hidden w-6 -mx-2" />
      </button>

      <div
        className="h-full overflow-auto flex-1"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>

      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-col-resize" style={{ background: 'transparent' }} />
      )}
    </div>
  );
};

export default ResizableSplitPane;
