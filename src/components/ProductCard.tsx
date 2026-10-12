import React from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { Heart, ShoppingCart, Eye, ArrowLeftRight, Star } from 'lucide-react';
import { trackLiveEvent } from '../services/liveTrafficTracker';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    viewProductDetails,
    setQuickViewProduct
  } = useApp();

  const isLiked = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  // Discount percentage calculation
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div 
      className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative flex flex-col h-full"
      id={`prod-card-${product.id}`}
    >
      {/* Badges / Floating Actions container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-zinc-950">
        
        {/* Main Product Image */}
        <img
          src={product.image || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80'}
          alt={product.imageAlt || product.name}
          title={product.imageTitle || product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          onClick={() => viewProductDetails(product.id)}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Labels Top Left */}
        <div className="absolute top-3.5 left-3.5 flex flex-col space-y-1.5 items-start">
          {discountPercent && discountPercent > 0 && (
            <span className="bg-red-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-1 rounded-lg shadow">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#0F9D58] text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-1 rounded-lg shadow">
              Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-1 rounded-lg shadow">
              New
            </span>
          )}
          {product.stock <= 0 && (
            <span className="bg-gray-800 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-1 rounded-lg shadow">
              Out of Stock
            </span>
          )}
        </div>

        {/* Floating Interactions (Right Sidebar style) */}
        <div className="absolute top-3.5 right-3.5 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
          
          {/* Wishlist */}
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2.5 rounded-full shadow-lg transition-all transform hover:scale-110 cursor-pointer ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:text-red-500'
            }`}
            title="Add to Wishlist"
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          </button>

          {/* Quick View */}
          <button
            onClick={() => setQuickViewProduct(product)}
            className="p-2.5 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:text-[#0F9D58] rounded-full shadow-lg hover:scale-110 transition-all cursor-pointer"
            title="Quick View"
          >
            <Eye size={16} />
          </button>

          {/* Compare */}
          <button
            onClick={() => toggleCompare(product.id)}
            className={`p-2.5 rounded-full shadow-lg transition-all transform hover:scale-110 cursor-pointer ${
              isCompared 
                ? 'bg-teal-500 text-white' 
                : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:text-teal-500'
            }`}
            title="Compare Product"
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>

        {/* Mobile quick actions (always visible on mobile) */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between space-x-1 sm:hidden">
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2 rounded-xl shadow-md ${isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-800'}`}
          >
            <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => setQuickViewProduct(product)}
            className="p-2 bg-white text-gray-800 rounded-xl shadow-md flex-1 text-[10px] font-bold flex items-center justify-center space-x-1"
          >
            <Eye size={12} />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Info details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Category */}
        <p className="text-[10px] font-extrabold uppercase text-[#0F9D58] tracking-widest leading-none mb-1.5">
          {product.category}
        </p>

        {/* Title */}
        <h3 
          className="text-sm sm:text-base font-bold text-gray-800 dark:text-white line-clamp-2 hover:text-[#0F9D58] cursor-pointer transition-colors flex-1"
          onClick={() => viewProductDetails(product.id)}
        >
          {product.name}
        </h3>

        {/* Rating and Reviews count */}
        <div className="flex items-center space-x-1 mt-2.5 mb-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={`${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200 dark:text-zinc-800'}`} 
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-gray-800 dark:text-zinc-300">{product.rating}</span>
          <span className="text-[10px] text-gray-400 dark:text-zinc-500">({product.reviewsCount})</span>
        </div>

        {/* Price & Cart button row */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 dark:border-zinc-800/50">
          <div>
            <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              Rs. {product.price.toLocaleString()}
            </p>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 dark:text-zinc-500 line-through">
                Rs. {product.originalPrice.toLocaleString()}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              addToCart(product);
              trackLiveEvent('add_to_cart', `Added to Cart: ${product.name} (Rs. ${product.price.toLocaleString()})`, 'product_catalog', { productId: product.id, price: product.price });
            }}
            disabled={product.stock <= 0}
            className={`p-2.5 sm:px-4 sm:py-2.5 rounded-2xl flex items-center justify-center space-x-1 transition-all ${
              product.stock <= 0
                ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed'
                : 'bg-[#0F9D58]/10 text-[#0F9D58] hover:bg-[#0F9D58] hover:text-white hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer'
            }`}
            title="Add to Cart"
          >
            <ShoppingCart size={16} />
            <span className="text-xs font-bold hidden sm:inline">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
