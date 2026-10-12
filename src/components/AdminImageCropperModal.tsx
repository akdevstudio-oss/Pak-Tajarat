import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Check, RotateCw, ZoomIn, ZoomOut, Move, Eye, Sparkles, Sliders, Layout,
  RefreshCw, Maximize2, Minimize2, Grid, Info, Scale, Ratio as AspectIcon,
  Maximize, FileText, ArrowUpRight
} from 'lucide-react';

interface AdminImageCropperModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onSave: (adjustedDataUrl: string) => void;
  productName?: string;
  productPrice?: number;
}

interface ImageMetaData {
  width: number;
  height: number;
  aspectRatioStr: string;
  fileSizeStr: string;
  orientation: 'Square' | 'Portrait' | 'Landscape';
}

// Calculate Greatest Common Divisor for ratio simplification
function getGCD(a: number, b: number): number {
  return b === 0 ? a : getGCD(b, a % b);
}

function calculateAspectRatio(w: number, h: number): { str: string; orientation: 'Square' | 'Portrait' | 'Landscape' } {
  if (!w || !h) return { str: '1:1', orientation: 'Square' };
  
  if (w === h) {
    return { str: '1:1 (Square)', orientation: 'Square' };
  }

  const gcd = getGCD(w, h);
  const rw = Math.round(w / gcd);
  const rh = Math.round(h / gcd);

  const orientation = w > h ? 'Landscape' : 'Portrait';

  if (rw <= 20 && rh <= 20) {
    return { str: `${rw}:${rh} (${orientation})`, orientation };
  }

  const ratio = (w / h).toFixed(2);
  return { str: `${ratio}:1 (${orientation})`, orientation };
}

function calculateFileSize(url: string, w: number, h: number): string {
  if (!url) return 'Unknown';
  if (url.startsWith('data:')) {
    const stringLength = url.length - url.indexOf(',') - 1;
    const bytes = Math.round(stringLength * 0.75);
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  }
  const estBytes = w * h * 0.35;
  if (estBytes >= 1024 * 1024) {
    return `~${(estBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `~${Math.round(estBytes / 1024)} KB`;
}

export const AdminImageCropperModal: React.FC<AdminImageCropperModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onSave,
  productName = 'Product Title Preview',
  productPrice = 2999,
}) => {
  const [fitMode, setFitMode] = useState<'contain' | 'cover' | 'fill' | 'original'>('contain');
  const [scale, setScale] = useState<number>(100); // 25% to 300%
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [offsetX, setOffsetX] = useState<number>(0); // displacement in px
  const [offsetY, setOffsetY] = useState<number>(0); // displacement in px
  const [bgColor, setBgColor] = useState<string>('#ffffff'); // background color
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const [dragStart, setDragStart] = useState<{ x: number; y: number; initialOffsetX: number; initialOffsetY: number }>({
    x: 0,
    y: 0,
    initialOffsetX: 0,
    initialOffsetY: 0,
  });

  const [metaData, setMetaData] = useState<ImageMetaData>({
    width: 0,
    height: 0,
    aspectRatioStr: 'Detecting...',
    fileSizeStr: 'Detecting...',
    orientation: 'Square',
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load natural image dimensions & detect metadata when imageUrl changes
  useEffect(() => {
    if (!imageUrl || !isOpen) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 800;
      const aspectInfo = calculateAspectRatio(w, h);
      const fileSize = calculateFileSize(imageUrl, w, h);

      setMetaData({
        width: w,
        height: h,
        aspectRatioStr: aspectInfo.str,
        fileSizeStr: fileSize,
        orientation: aspectInfo.orientation,
      });
    };

    // Reset editor parameters
    setFitMode('contain');
    setScale(100);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
    setBgColor('#ffffff');
  }, [imageUrl, isOpen]);

  // Handle Dragging via Mouse in ALL directions
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialOffsetX: offsetX,
      initialOffsetY: offsetY,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setOffsetX(dragStart.initialOffsetX + deltaX);
    setOffsetY(dragStart.initialOffsetY + deltaY);
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle Dragging via Touch (Mobile) in ALL directions
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX,
        y: touch.clientY,
        initialOffsetX: offsetX,
        initialOffsetY: offsetY,
      });
    }
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    setOffsetX(dragStart.initialOffsetX + deltaX);
    setOffsetY(dragStart.initialOffsetY + deltaY);
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Handle Mouse Wheel Zoom inside container
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 5 : -5;
    setScale((prev) => Math.min(300, Math.max(25, prev + zoomDelta)));
  };

  if (!isOpen || !imageUrl) return null;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleAutoFit = () => {
    setFitMode('contain');
    setScale(100);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
    setBgColor('#ffffff');
  };

  const handleApplyAndSave = () => {
    const canvas = document.createElement('canvas');
    const canvasSize = 800; // Optimized 800x800 square 1:1 canvas (under 50KB base64)
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      onSave(imageUrl);
      onClose();
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      // 1. Fill Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // 2. Measure scaling ratio between DOM editor container and high-res canvas
      const containerSize = containerRef.current ? containerRef.current.clientWidth : 400;
      const ratio = canvasSize / containerSize;

      // 3. Save context for transformations
      ctx.save();

      // Center of canvas with offset
      const centerX = canvasSize / 2 + offsetX * ratio;
      const centerY = canvasSize / 2 + offsetY * ratio;

      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);

      // Calculate Natural Aspect Ratio strictly
      const imgW = img.naturalWidth || 800;
      const imgH = img.naturalHeight || 800;
      const imgAspect = imgW / imgH;

      let drawW = canvasSize;
      let drawH = canvasSize;

      if (fitMode === 'contain') {
        // Occupy 92% of the canvas frame without any cropping or stretching
        const targetFrame = canvasSize * 0.92;
        if (imgAspect >= 1) {
          drawW = targetFrame;
          drawH = targetFrame / imgAspect;
        } else {
          drawH = targetFrame;
          drawW = targetFrame * imgAspect;
        }
      } else if (fitMode === 'cover') {
        if (imgAspect >= 1) {
          drawH = canvasSize;
          drawW = canvasSize * imgAspect;
        } else {
          drawW = canvasSize;
          drawH = canvasSize / imgAspect;
        }
      } else if (fitMode === 'fill') {
        drawW = canvasSize;
        drawH = canvasSize;
      } else {
        // Original size
        drawW = imgW;
        drawH = imgH;
      }

      // Apply zoom scale factor
      drawW = drawW * (scale / 100);
      drawH = drawH * (scale / 100);

      // Draw image centered without distortion
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      ctx.restore();

      // Export canvas as lightweight data URL (WebP or JPEG @ 0.80)
      let dataUrl = '';
      try {
        dataUrl = canvas.toDataURL('image/webp', 0.80);
      } catch (err) {
        console.warn('WebP export fallback:', err);
      }
      if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.80);
      }

      onSave(dataUrl);
      onClose();
    };

    img.onerror = () => {
      onSave(imageUrl);
      onClose();
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 text-white animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-5xl w-full max-h-[96vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center space-x-2">
              <Sliders size={18} className="text-emerald-400" />
              <span>Smart Product Image Editor & Frame Optimizer</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Drag in ALL directions to position. Zoom and auto-fit while preserving crisp original aspect ratio.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Image Detection Metadata Bar */}
        <div className="bg-zinc-950/80 px-4 py-2.5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-zinc-300">
            <span className="flex items-center space-x-1.5 font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              <Scale size={13} />
              <span>Dimensions: {metaData.width} × {metaData.height} px</span>
            </span>

            <span className="flex items-center space-x-1.5 font-mono text-blue-400 font-semibold bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-500/30">
              <AspectIcon size={13} />
              <span>Aspect Ratio: {metaData.aspectRatioStr}</span>
            </span>

            <span className="flex items-center space-x-1.5 font-mono text-amber-400 font-semibold bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
              <FileText size={13} />
              <span>File Size: {metaData.fileSizeStr}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleAutoFit}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1 rounded-lg shadow transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles size={13} />
            <span>⚡ Auto Fit (1:1 Frame)</span>
          </button>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Left Column: Interactive Canvas Frame Editor */}
          <div className="md:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Move size={14} />
                <span>Interactive Square Canvas (1:1 Frame)</span>
              </span>
              <button
                type="button"
                onClick={handleAutoFit}
                className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer flex items-center space-x-1"
              >
                <RefreshCw size={12} />
                <span>Reset to Center</span>
              </button>
            </div>

            {/* 1:1 Square Frame Container */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onWheel={handleWheel}
              className={`relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-2xl flex items-center justify-center select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{ backgroundColor: bgColor }}
            >
              {/* Image Transform Layer */}
              <div
                className="absolute flex items-center justify-center transition-transform duration-75 ease-out pointer-events-none w-full h-full"
                style={{
                  transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale / 100})`,
                  transformOrigin: 'center center',
                }}
              >
                <img
                  src={imageUrl}
                  alt="Editor Canvas"
                  className={`pointer-events-none transition-all ${
                    fitMode === 'contain'
                      ? 'max-w-[92%] max-h-[92%] object-contain'
                      : fitMode === 'cover'
                      ? 'w-full h-full object-cover'
                      : fitMode === 'fill'
                      ? 'w-full h-full object-fill'
                      : 'max-w-none max-h-none'
                  }`}
                  referrerPolicy="no-referrer"
                  style={{
                    aspectRatio: metaData.width && metaData.height ? `${metaData.width} / ${metaData.height}` : 'auto',
                  }}
                />
              </div>

              {/* Crop Grid Lines Overlay */}
              <div className="absolute inset-0 pointer-events-none border border-emerald-500/40">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/10" />
                  ))}
                </div>
              </div>

              {/* Helpful Floating Hint */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-medium text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5 shadow-xl">
                <Move size={13} className="text-emerald-400" />
                <span>Drag in any direction (Up/Down/Left/Right) | Mouse wheel to zoom</span>
              </div>

              {/* Corner Crop Marks */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />
            </div>

            {/* Quick Controls Toolbar */}
            <div className="space-y-3 bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
              {/* Fit Mode Options */}
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1.5">
                  1. Image Fit & Layout Mode:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFitMode('contain');
                      setScale(100);
                      setOffsetX(0);
                      setOffsetY(0);
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer flex items-center justify-center space-x-1 ${
                      fitMode === 'contain'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Minimize2 size={13} />
                    <span>Fit (Contain)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFitMode('cover');
                      setScale(100);
                      setOffsetX(0);
                      setOffsetY(0);
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer flex items-center justify-center space-x-1 ${
                      fitMode === 'cover'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Maximize2 size={13} />
                    <span>Fill (Cover)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFitMode('fill');
                      setScale(100);
                      setOffsetX(0);
                      setOffsetY(0);
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer flex items-center justify-center space-x-1 ${
                      fitMode === 'fill'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Maximize size={13} />
                    <span>Stretch Fill</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFitMode('original');
                      setScale(100);
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer flex items-center justify-center space-x-1 ${
                      fitMode === 'original'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Grid size={13} />
                    <span>Original Size</span>
                  </button>
                </div>
              </div>

              {/* Zoom Slider Controls (25% to 300%) */}
              <div>
                <div className="flex justify-between items-center text-[11px] font-bold text-zinc-300 mb-1">
                  <span>2. Zoom Slider (25% to 300%):</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setScale((prev) => Math.max(25, prev - 10))}
                      className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut size={12} />
                    </button>
                    <span className="text-emerald-400 font-mono font-bold text-xs">{scale}%</span>
                    <button
                      type="button"
                      onClick={() => setScale((prev) => Math.min(300, prev + 10))}
                      className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn size={12} />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={25}
                  max={300}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  {[25, 50, 100, 150, 200, 300].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setScale(preset)}
                      className={`hover:text-emerald-400 cursor-pointer ${scale === preset ? 'text-emerald-400 font-bold' : ''}`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color & Rotation Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-zinc-300">Background Color:</span>
                  {['#ffffff', '#f8fafc', '#18181b', '#000000', '#f1f5f9'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBgColor(color)}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform ${
                        bgColor === color ? 'border-emerald-500 scale-110 shadow-md' : 'border-zinc-700'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-6 h-6 rounded-md border-none cursor-pointer bg-transparent"
                    title="Custom Background Color"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRotate}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCw size={14} />
                  <span>Rotate ({rotation}°)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Website Product Card Live Preview */}
          <div className="md:col-span-5 flex flex-col space-y-3 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-5">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Layout size={14} />
              <span>Exact Product Page & Card Preview</span>
            </span>

            {/* Product Card Mockup on Frontend Website */}
            <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-2xl max-w-xs mx-auto w-full">
              {/* Image Frame Mockup */}
              <div
                className="relative aspect-square w-full overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: bgColor }}
              >
                <div
                  className="absolute flex items-center justify-center transition-transform duration-75 w-full h-full"
                  style={{
                    transform: `translate(${offsetX * 0.7}px, ${offsetY * 0.7}px) rotate(${rotation}deg) scale(${scale / 100})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={productName}
                    className={`transition-all ${
                      fitMode === 'contain'
                        ? 'max-w-[92%] max-h-[92%] object-contain'
                        : fitMode === 'cover'
                        ? 'w-full h-full object-cover'
                        : fitMode === 'fill'
                        ? 'w-full h-full object-fill'
                        : 'max-w-none max-h-none'
                    }`}
                    referrerPolicy="no-referrer"
                    style={{
                      aspectRatio: metaData.width && metaData.height ? `${metaData.width} / ${metaData.height}` : 'auto',
                    }}
                  />
                </div>
                <span className="absolute top-2 left-2 bg-[#0F9D58] text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow">
                  SPECIAL OFFER
                </span>
              </div>

              {/* Card Body */}
              <div className="p-3.5 space-y-2">
                <p className="text-[10px] font-bold text-[#0F9D58] uppercase tracking-wide">Featured Category</p>
                <h4 className="font-bold text-xs line-clamp-2">{productName}</h4>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-black text-sm text-[#0F9D58]">Rs. {productPrice.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 line-through ml-1.5">Rs. {(productPrice * 1.25).toFixed(0)}</span>
                  </div>
                  <div className="bg-[#0F9D58] text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                    Buy Now
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-2xl text-[11px] text-emerald-300 leading-relaxed space-y-1">
              <p className="font-bold flex items-center space-x-1">
                <Sparkles size={13} className="text-emerald-400" />
                <span>Zero-Distortion Canvas Render</span>
              </p>
              <p className="text-zinc-400">
                Your positioning, zoom, and background color will be saved directly into a high-definition 1:1 image frame. This guarantees the image displays cleanly and perfectly across all browsers and devices!
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyAndSave}
            className="px-6 py-2.5 bg-[#0F9D58] hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center space-x-2 cursor-pointer"
          >
            <Check size={16} />
            <span>Apply & Save Optimized Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
