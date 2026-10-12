import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Move } from 'lucide-react';

interface ProductImageViewerProps {
  src: string;
  alt: string;
  title?: string;
  onOpenLightbox?: () => void;
  className?: string;
  showControls?: boolean;
}

export const ProductImageViewer: React.FC<ProductImageViewerProps> = ({
  src,
  alt,
  title,
  onOpenLightbox,
  className = '',
  showControls = true
}) => {
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%, 5 = 500%
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef<number | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Reset zoom & pan when image src changes
  useEffect(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  // Constrain position so image doesn't pan infinitely into white space
  const clampPosition = useCallback((newX: number, newY: number, currentZoom: number) => {
    if (currentZoom <= 1) return { x: 0, y: 0 };
    if (!containerRef.current) return { x: newX, y: newY };

    const rect = containerRef.current.getBoundingClientRect();
    const maxX = (rect.width * (currentZoom - 1)) / 2;
    const maxY = (rect.height * (currentZoom - 1)) / 2;

    return {
      x: Math.min(Math.max(newX, -maxX), maxX),
      y: Math.min(Math.max(newY, -maxY), maxY)
    };
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    const clampedZoom = Math.min(Math.max(newZoom, 1), 5); // 100% to 500%
    setZoomLevel(clampedZoom);
    if (clampedZoom === 1) {
      setPosition({ x: 0, y: 0 });
    } else {
      setPosition(prev => clampPosition(prev.x, prev.y, clampedZoom));
    }
  }, [clampPosition]);

  const handleZoomIn = () => handleZoomChange(zoomLevel + 0.5);
  const handleZoomOut = () => handleZoomChange(zoomLevel - 0.5);
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleToggleDoubleTapZoom = (clientX?: number, clientY?: number) => {
    if (zoomLevel > 1) {
      handleResetZoom();
    } else {
      handleZoomChange(2.5); // Double click zooms to 250%
    }
  };

  // Double Click handler (Desktop)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleToggleDoubleTapZoom(e.clientX, e.clientY);
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    handleZoomChange(zoomLevel + delta);
  };

  // Mouse Drag / Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    const rawX = e.clientX - dragStartRef.current.x;
    const rawY = e.clientY - dragStartRef.current.y;
    setPosition(clampPosition(rawX, rawY, zoomLevel));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers for Mobile (Pinch-to-zoom & Touch Pan & Double Tap)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single finger: potential drag or double-tap
      const now = Date.now();
      if (now - lastTapTimeRef.current < 300) {
        // Double tap detected
        handleToggleDoubleTapZoom();
        lastTapTimeRef.current = 0;
        return;
      }
      lastTapTimeRef.current = now;

      if (zoomLevel > 1) {
        setIsDragging(true);
        dragStartRef.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        };
      }
    } else if (e.touches.length === 2) {
      // Two fingers: pinch zoom start
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
      const rawX = e.touches[0].clientX - dragStartRef.current.x;
      const rawY = e.touches[0].clientY - dragStartRef.current.y;
      setPosition(clampPosition(rawX, rawY, zoomLevel));
    } else if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / lastTouchDistanceRef.current;
      handleZoomChange(zoomLevel * factor);
      lastTouchDistanceRef.current = currentDist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistanceRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-square bg-gray-50 dark:bg-zinc-950/80 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800/80 flex items-center justify-center select-none group ${
        zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
      } ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
    >
      {/* Complete Uncropped Centered Image */}
      <div
        className="w-full h-full flex items-center justify-center p-0 transition-transform duration-100 ease-out pointer-events-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center'
        }}
      >
        <img
          src={src || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80'}
          alt={alt}
          title={title || alt}
          className="w-full h-full object-contain drop-shadow-md rounded-lg pointer-events-auto"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
          }}
        />
      </div>

      {/* Floating Toolbar Controls */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          {/* Zoom Percentage Indicator */}
          <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-bold text-white border border-white/10 flex items-center space-x-1 shadow-md">
            <span>{Math.round(zoomLevel * 100)}%</span>
            {zoomLevel > 1 && <Move size={11} className="text-emerald-400 animate-pulse" />}
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex items-center space-x-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl pointer-events-auto">
            {/* Zoom Out (-) */}
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut size={16} />
            </button>

            {/* Zoom In (+) */}
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 5}
              className="p-1.5 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn size={16} />
            </button>

            {/* Reset Zoom (100%) */}
            <button
              type="button"
              onClick={handleResetZoom}
              disabled={zoomLevel === 1}
              className="p-1.5 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all cursor-pointer text-[10px] font-bold px-2 flex items-center space-x-1"
              title="Reset Zoom (100%)"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">100%</span>
            </button>

            {/* Full Screen Lightbox Toggle */}
            {onOpenLightbox && (
              <button
                type="button"
                onClick={onOpenLightbox}
                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1 ml-1"
                title="Open Fullscreen Lightbox"
              >
                <Maximize2 size={15} />
                <span className="text-[10px] hidden sm:inline">Full Screen</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
