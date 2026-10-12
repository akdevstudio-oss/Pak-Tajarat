import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Maximize2, Minimize2, Move } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productName: string;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  productName
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%, 5 = 500%
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef<number | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

  const handleSelectImage = (index: number) => {
    setCurrentIndex(index);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((prev) => Math.min(prev + 0.5, 5));
      } else if (e.key === '-') {
        setZoomLevel((prev) => Math.max(prev - 0.5, 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  // Clamp position so image stays within bounds
  const clampPosition = useCallback((newX: number, newY: number, currentZoom: number) => {
    if (currentZoom <= 1) return { x: 0, y: 0 };
    return { x: newX, y: newY };
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    const clamped = Math.min(Math.max(newZoom, 1), 5); // 100% to 500%
    setZoomLevel(clamped);
    if (clamped === 1) setPosition({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = () => handleZoomChange(zoomLevel + 0.5);
  const handleZoomOut = () => handleZoomChange(zoomLevel - 0.5);
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleToggleZoom = () => {
    if (zoomLevel > 1) {
      handleResetZoom();
    } else {
      handleZoomChange(2.5);
    }
  };

  // Browser Fullscreen API Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.log(err));
      setIsFullscreen(false);
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    handleZoomChange(zoomLevel + delta);
  };

  // Dragging / Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapTimeRef.current < 300) {
        handleToggleZoom();
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
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y
      });
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

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0] || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 text-white animate-in fade-in duration-200 select-none overflow-hidden"
    >
      {/* Top Header & Controls */}
      <div className="flex items-center justify-between z-10 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl">
        <div className="min-w-0 pr-2">
          <h3 className="font-bold text-sm sm:text-base truncate text-white">{productName}</h3>
          <p className="text-[11px] text-zinc-400 flex items-center space-x-2">
            <span>Image {currentIndex + 1} of {images.length}</span>
            <span className="text-emerald-400 font-bold">• Zoom: {Math.round(zoomLevel * 100)}%</span>
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Zoom Out (-) */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-xl transition-all cursor-pointer text-white"
            title="Zoom Out (-)"
          >
            <ZoomOut size={18} />
          </button>
          
          {/* Zoom In (+) */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 5}
            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-xl transition-all cursor-pointer text-white"
            title="Zoom In (+)"
          >
            <ZoomIn size={18} />
          </button>

          {/* Reset (100%) */}
          <button
            type="button"
            onClick={handleResetZoom}
            disabled={zoomLevel === 1}
            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-xl transition-all cursor-pointer text-white flex items-center space-x-1 text-xs font-bold"
            title="Reset Zoom (100%)"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Full Screen Mode Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all cursor-pointer text-white hidden sm:flex"
            title="Toggle Browser Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {/* Close Lightbox Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold transition-all cursor-pointer ml-1"
            title="Close Lightbox (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Interactive Lightbox Area */}
      <div 
        className={`relative flex-1 flex items-center justify-center my-3 sm:my-4 overflow-hidden rounded-3xl bg-zinc-950/90 border border-white/10 ${
          zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleToggleZoom}
      >
        {/* Prev Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
              setZoomLevel(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="absolute left-3 sm:left-5 z-20 p-3 bg-black/70 hover:bg-emerald-600 border border-white/20 text-white rounded-full transition-all shadow-2xl backdrop-blur-sm cursor-pointer"
            title="Previous Image (Left Arrow)"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Complete Uncropped Image Container */}
        <div 
          className="w-full h-full flex items-center justify-center p-2 sm:p-3 transition-transform duration-100 ease-out pointer-events-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center'
          }}
        >
          <img
            src={currentImage}
            alt={`${productName} view ${currentIndex + 1}`}
            className="w-full h-full max-h-[88vh] object-contain drop-shadow-2xl rounded-xl pointer-events-auto"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </div>

        {/* Next Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
              setZoomLevel(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="absolute right-3 sm:right-5 z-20 p-3 bg-black/70 hover:bg-emerald-600 border border-white/20 text-white rounded-full transition-all shadow-2xl backdrop-blur-sm cursor-pointer"
            title="Next Image (Right Arrow)"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Hint overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[11px] text-zinc-300 pointer-events-none flex items-center space-x-2 shadow-xl">
          <Move size={13} className="text-emerald-400" />
          <span>Double click/tap to toggle zoom • Scroll wheel / Pinch to zoom • Drag to pan</span>
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex items-center justify-center space-x-2 overflow-x-auto p-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 max-w-xl mx-auto w-full">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectImage(idx)}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-zinc-950 p-0.5 ${
                currentIndex === idx ? 'border-emerald-500 scale-105 shadow-lg shadow-emerald-950' : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
