import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ImageZoomModal } from './ImageZoomModal';
import { ProductImageViewer } from './ProductImageViewer';
import { X, Star, Plus, Minus, ShoppingCart, Heart, ShieldAlert, ZoomIn } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, isInWishlist } = useApp();
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      setActiveImage(quickViewProduct.image);
      setQuantity(1);
      setIsZoomOpen(false);
    }
  }, [quickViewProduct]);

  const galleryList = useMemo(() => {
    if (!quickViewProduct) return [];
    if (quickViewProduct.images && quickViewProduct.images.length > 0) return quickViewProduct.images;
    return quickViewProduct.image ? [quickViewProduct.image] : ['https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80'];
  }, [quickViewProduct]);

  const currentGalleryIndex = useMemo(() => {
    const idx = galleryList.indexOf(activeImage);
    return idx >= 0 ? idx : 0;
  }, [galleryList, activeImage]);

  if (!quickViewProduct) return null;

  const isLiked = isInWishlist(quickViewProduct.id);

  const incrementQty = () => {
    if (quantity < quickViewProduct.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity);
    setQuickViewProduct(null); // Close modal
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="quick-view-overlay">
      
      {/* Modal Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-300 rounded-full transition-colors z-10 cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <ProductImageViewer
              src={(activeImage || quickViewProduct.image) || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80'}
              alt={quickViewProduct.imageAlt || quickViewProduct.name}
              title={quickViewProduct.imageTitle || quickViewProduct.name}
              onOpenLightbox={() => setIsZoomOpen(true)}
            />

            {/* Thumbnail selector */}
            {galleryList.length > 1 && (
              <div className="flex space-x-2.5 overflow-x-auto p-1">
                {galleryList.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer p-0.5 bg-gray-50 dark:bg-zinc-950/80 ${
                      (activeImage || quickViewProduct.image) === img 
                        ? 'border-[#0F9D58] scale-105 shadow' 
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img 
                      src={img || undefined} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {/* Category */}
              <p className="text-xs font-extrabold uppercase text-[#0F9D58] tracking-widest leading-none mb-2">
                {quickViewProduct.category}
              </p>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                {quickViewProduct.name}
              </h2>

              {/* Rating & reviews summary */}
              <div className="flex items-center space-x-1.5 mt-3 mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={`${i < Math.floor(quickViewProduct.rating) ? 'fill-current' : 'text-gray-200 dark:text-zinc-800'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-300">
                  {quickViewProduct.rating} / 5.0
                </span>
                <span className="text-xs text-gray-400">
                  ({quickViewProduct.reviewsCount} customer reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-3 bg-gray-50 dark:bg-zinc-950/20 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800/20 mb-4">
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                  Rs. {quickViewProduct.price.toLocaleString()}
                </span>
                {quickViewProduct.originalPrice && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      Rs. {quickViewProduct.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-lg">
                      Save Rs. {(quickViewProduct.originalPrice - quickViewProduct.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Info */}
              <div className="flex items-center space-x-2 text-xs mb-4">
                {quickViewProduct.stock > 0 ? (
                  <div className="flex items-center text-green-600 dark:text-green-400 font-bold">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-ping" />
                    <span>In Stock ({quickViewProduct.stock} items left)</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-500 font-bold">
                    <ShieldAlert size={14} className="mr-1" />
                    <span>Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Brief Description */}
              <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                {quickViewProduct.description}
              </p>

              {/* Specs preview (up to 3 items) */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Specifications</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-zinc-400">
                  {Object.entries(quickViewProduct.specifications).slice(0, 4).map(([key, value], specIdx) => (
                    <div key={`${key}-${specIdx}`} className="flex flex-col sm:flex-row sm:space-x-1">
                      <span className="font-semibold text-gray-800 dark:text-zinc-300">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800 mt-auto">
              
              {quickViewProduct.stock > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Choose Quantity</span>
                  <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-gray-50 dark:bg-zinc-950/20">
                    <button
                      onClick={decrementQty}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-5 text-sm font-bold text-gray-800 dark:text-white">{quantity}</span>
                    <button
                      onClick={incrementQty}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleAddToCart}
                  disabled={quickViewProduct.stock <= 0}
                  className={`flex-1 py-3 px-6 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-md transition-all ${
                    quickViewProduct.stock <= 0
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed'
                      : 'bg-[#0F9D58] hover:bg-[#0B7B44] text-white hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                  }`}
                >
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                  className={`p-3 rounded-2xl border transition-all ${
                    isLiked
                      ? 'bg-red-500 border-red-500 text-white shadow-md'
                      : 'border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10'
                  }`}
                  title="Add to Wishlist"
                >
                  <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Lightbox Image Zoom Modal */}
      <ImageZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        images={galleryList}
        initialIndex={currentGalleryIndex}
        productName={quickViewProduct.name}
      />
    </div>
  );
};
