import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../data/initialData';
import { 
  Search, SlidersHorizontal, Star, RefreshCw, X, 
  ArrowUpDown, ChevronLeft, ChevronRight, ArrowLeftRight, Trash2
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { 
    products, 
    compareList, 
    toggleCompare, 
    viewProductDetails, 
    setQuickViewProduct,
    addToCart,
    headerSearchQuery,
    setHeaderSearchQuery
  } = useApp();

  // Filter States
  const [searchQuery, setSearchQuery] = useState(headerSearchQuery || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Synchronize when header search query changes
  useEffect(() => {
    if (headerSearchQuery !== undefined && headerSearchQuery !== searchQuery) {
      setSearchQuery(headerSearchQuery);
      setCurrentPage(1);
    }
  }, [headerSearchQuery]);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'priceLowHigh' | 'priceHighLow' | 'rating' | 'name'>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);

  const itemsPerPage = 8;

  // Derived Min & Max Prices for visual limits
  const productPriceLimits = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100000 };
    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [products]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    if (setHeaderSearchQuery) setHeaderSearchQuery('');
    setSelectedCategories([]);
    setMaxPrice(productPriceLimits.max);
    setMinRating(null);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev => {
      const active = prev.includes(cat) 
        ? prev.filter(c => c !== cat) 
        : [...prev, cat];
      setCurrentPage(1);
      return active;
    });
  };

  // Filter & Sort Logic
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Filter published products only (exclude draft or future scheduled)
    const now = Date.now();
    result = result.filter(p => {
      if (p.status === 'draft') return false;
      if (p.status === 'scheduled' && p.scheduledPublishDate) {
        return new Date(p.scheduledPublishDate).getTime() <= now;
      }
      return true;
    });

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Categories filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Price filter
    result = result.filter(p => p.price <= maxPrice);

    // Rating filter
    if (minRating !== null) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Sort order
    switch (sortBy) {
      case 'priceLowHigh':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighLow':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        // Featured products first, then bestsellers
        result.sort((a, b) => {
          const scoreA = (a.isFeatured ? 2 : 0) + (a.isBestSeller ? 1 : 0);
          const scoreB = (b.isFeatured ? 2 : 0) + (b.isBestSeller ? 1 : 0);
          return scoreB - scoreA;
        });
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategories, maxPrice, minRating, sortBy]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(processedProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [processedProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Compared Products Detailed objects
  const comparedProducts = useMemo(() => {
    return products.filter(p => compareList.includes(p.id));
  }, [products, compareList]);

  return (
    <div className="w-full pb-16 animate-in fade-in duration-300 relative" id="products-view-container">
      
      {/* Search and Title strip */}
      <div className="bg-gray-50 dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-gray-100/50 dark:border-zinc-800 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase text-[#0F9D58] tracking-widest">Premium Catalog</span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-1">
            Explore All Products
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Showing {processedProducts.length} certified items in stock</p>
        </div>

        {/* Live Search Input inside products bar */}
        <div className="relative max-w-md w-full md:w-80">
          <input
            type="text"
            placeholder="Filter product index..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl pl-5 pr-10 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#0F9D58] shadow-sm"
          />
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDEBAR: Desktop Filters */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm sticky top-24">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center space-x-2 text-sm uppercase tracking-wider">
              <SlidersHorizontal size={16} className="text-[#0F9D58]" />
              <span>Filter Options</span>
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-xs font-bold text-gray-400 hover:text-[#0F9D58] flex items-center space-x-1"
              title="Reset Filters"
            >
              <RefreshCw size={12} />
              <span>Reset</span>
            </button>
          </div>

          {/* Categories Selector */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Categories</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {CATEGORIES.map((cat, idx) => {
                const checked = selectedCategories.includes(cat);
                return (
                  <label key={`${cat}-${idx}`} className="flex items-center space-x-2.5 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleCategoryToggle(cat)}
                      className="rounded text-[#0F9D58] focus:ring-[#0F9D58] border-gray-300 dark:border-zinc-800 w-4 h-4 cursor-pointer"
                    />
                    <span className={`font-semibold ${checked ? 'text-[#0F9D58]' : 'text-gray-600 dark:text-zinc-300'}`}>
                      {cat}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex justify-between text-xs font-black uppercase text-gray-400 tracking-wider">
              <span>Price Cap</span>
              <span className="text-[#0F9D58] font-bold">Rs. {maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={productPriceLimits.min}
              max={productPriceLimits.max || 100000}
              step={100}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full accent-[#0F9D58] h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-bold">
              <span>Min: Rs. {productPriceLimits.min.toLocaleString()}</span>
              <span>Max: Rs. {productPriceLimits.max.toLocaleString()}</span>
            </div>
          </div>

          {/* Rating Filter stars */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Minimum Rating</h4>
            <div className="space-y-2">
              {[4, 3, 2].map(stars => (
                <button
                  key={stars}
                  onClick={() => {
                    setMinRating(minRating === stars ? null : stars);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all border ${
                    minRating === stars 
                      ? 'bg-emerald-50/50 dark:bg-zinc-800 border-[#0F9D58]/30 text-[#0F9D58]' 
                      : 'border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-600 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={`${i < stars ? 'fill-current' : 'text-gray-200 dark:text-zinc-800'}`} />
                    ))}
                  </div>
                  <span>{stars}.0 & Up</span>
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* PRODUCTS AREA */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Controls Strip (Sort, Mobile Filter button) */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            
            {/* Mobile Filter toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden bg-[#0F9D58]/10 text-[#0F9D58] hover:bg-[#0F9D58] hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <SlidersHorizontal size={14} />
              <span>Filter Items</span>
            </button>

            <p className="text-xs font-bold text-gray-500 hidden sm:block">
              Found <span className="text-gray-800 dark:text-white">{processedProducts.length}</span> matching products
            </p>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown size={14} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-[#0F9D58]"
              >
                <option value="featured">Vetted (Featured)</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Active Filters Tag strips */}
          {(selectedCategories.length > 0 || minRating !== null || searchQuery.trim() !== '') && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-400 font-bold">Active:</span>
              
              {searchQuery && (
                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center space-x-1">
                  <span>Search: "{searchQuery}"</span>
                  <X size={12} className="cursor-pointer" onClick={() => setSearchQuery('')} />
                </span>
              )}

              {selectedCategories.map((cat, idx) => (
                <span key={`${cat}-${idx}`} className="bg-emerald-50 dark:bg-[#0F9D58]/10 text-[#0F9D58] text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center space-x-1">
                  <span>{cat}</span>
                  <X size={12} className="cursor-pointer" onClick={() => handleCategoryToggle(cat)} />
                </span>
              ))}

              {minRating !== null && (
                <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center space-x-1">
                  <span>★ {minRating}.0+</span>
                  <X size={12} className="cursor-pointer" onClick={() => setMinRating(null)} />
                </span>
              )}

              <button 
                onClick={handleResetFilters}
                className="text-xs font-extrabold text-[#0F9D58] hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* PRODUCTS GRID */}
          {paginatedProducts.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-zinc-950 flex items-center justify-center text-gray-400 mx-auto text-xl">🔍</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Products Found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                We couldn't find any products matching your active filters. Try adjusting your price range or clearing category filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-[#0F9D58] hover:bg-[#0B7B44] text-white text-xs font-bold py-2 px-6 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {paginatedProducts.map((p, idx) => (
                <ProductCard key={p.id ? `${p.id}-${idx}` : `prod-${idx}`} product={p} />
              ))}
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl hover:text-[#0F9D58] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#0F9D58] border-[#0F9D58] text-white shadow'
                        : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl hover:text-[#0F9D58] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </main>
      </div>

      {/* MOBILE FILTERS DRAWER / OVERLAY */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" id="mobile-filter-drawer">
          <div className="w-4/5 max-w-sm bg-white dark:bg-zinc-900 h-full shadow-2xl p-6 overflow-y-auto flex flex-col space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Filter Products</h3>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Same sidebar selectors for mobile */}
            <div className="space-y-4 flex-1">
              {/* Category */}
              <div className="space-y-2.5">
                <p className="text-xs font-black uppercase text-gray-400">Categories</p>
                <div className="grid grid-cols-1 gap-2">
                  {CATEGORIES.map((cat, idx) => (
                    <label key={`${cat}-${idx}`} className="flex items-center space-x-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryToggle(cat)}
                        className="rounded text-[#0F9D58] focus:ring-[#0F9D58] border-gray-300 dark:border-zinc-800"
                      />
                      <span className="font-semibold text-gray-700 dark:text-zinc-300">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <div className="flex justify-between text-xs font-black uppercase text-gray-400">
                  <span>Price Cap</span>
                  <span className="text-[#0F9D58] font-bold">Rs. {maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={productPriceLimits.min}
                  max={productPriceLimits.max}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#0F9D58]"
                />
              </div>

              {/* Rating */}
              <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <p className="text-xs font-black uppercase text-gray-400">Minimum Rating</p>
                <div className="space-y-2">
                  {[4, 3, 2].map(stars => (
                    <button
                      key={stars}
                      onClick={() => {
                        setMinRating(minRating === stars ? null : stars);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center space-x-2 border ${
                        minRating === stars ? 'bg-emerald-50 dark:bg-zinc-800 border-[#0F9D58]' : 'border-transparent'
                      }`}
                    >
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} className={`${i < stars ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span>{stars}.0 & Up</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex space-x-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-600 dark:text-zinc-300"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-2.5 bg-[#0F9D58] text-white rounded-xl text-xs font-bold shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING COMPARE DRAWER (Extra feature) */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 shadow-2xl z-40 transition-transform duration-300">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-zinc-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <ArrowLeftRight className="text-[#0F9D58]" size={18} />
                <span className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base">
                  Product Comparison Matrix ({compareList.length}/3)
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCompareDrawer(!showCompareDrawer)}
                  className="text-xs font-bold text-[#0F9D58] hover:underline"
                >
                  {showCompareDrawer ? 'Minimize Drawer' : 'Expand Matrix'}
                </button>
              </div>
            </div>

            {/* Compare Drawer Details */}
            {showCompareDrawer ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-80 overflow-y-auto pt-2 animate-in slide-in-from-bottom duration-150">
                {comparedProducts.map((p, idx) => (
                  <div key={p.id ? `${p.id}-${idx}` : `cmp-${idx}`} className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 relative space-y-3 text-xs">
                    {/* Remove from compare button */}
                    <button
                      onClick={() => toggleCompare(p.id)}
                      className="absolute top-3 right-3 p-1 bg-white dark:bg-zinc-900 hover:text-red-500 rounded-full border border-gray-100 dark:border-zinc-800 cursor-pointer"
                    >
                      <X size={14} />
                    </button>

                    <div className="flex items-center space-x-3">
                      <img src={p.image || undefined} alt={p.name} className="w-12 h-12 object-cover rounded-lg" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{p.name}</p>
                        <p className="font-black text-[#0F9D58] text-xs mt-0.5">Rs. {p.price.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Matrix Specs rows */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-600 dark:text-zinc-400">
                      <div>
                        <span className="font-bold text-gray-800 dark:text-zinc-300">Category:</span> {p.category}
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 dark:text-zinc-300">Rating:</span> ★ {p.rating} ({p.reviewsCount})
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 dark:text-zinc-300">Stock:</span> {p.stock > 0 ? `${p.stock} units` : 'Out of Stock'}
                      </div>
                      <div className="pt-1.5 font-sans italic truncate">
                        <span className="font-bold text-gray-800 dark:text-zinc-300 block not-italic">Vibe:</span> {p.description}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => addToCart(p)}
                        disabled={p.stock <= 0}
                        className="w-full bg-[#0F9D58] text-white font-bold py-1.5 rounded-xl text-[10px] shadow cursor-pointer disabled:opacity-45"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-4 overflow-x-auto pb-1">
                {comparedProducts.map((p, idx) => (
                  <div key={p.id ? `${p.id}-${idx}` : `cmp-bar-${idx}`} className="flex items-center bg-gray-50 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-zinc-800 text-xs shrink-0 space-x-2">
                    <img src={p.image || undefined} alt={p.name} className="w-7 h-7 object-cover rounded" referrerPolicy="no-referrer" />
                    <span className="font-bold text-gray-700 dark:text-zinc-300 max-w-[120px] truncate">{p.name}</span>
                    <button onClick={() => toggleCompare(p.id)} className="text-gray-400 hover:text-red-500">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
