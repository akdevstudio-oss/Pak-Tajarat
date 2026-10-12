import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Review } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ImageZoomModal } from '../components/ImageZoomModal';
import { ProductImageViewer } from '../components/ProductImageViewer';
import { Star, ShoppingCart, Heart, Plus, Minus, ArrowLeftRight, MessageSquare, ShieldAlert, BadgeCheck, Copy, Play, Film, ZoomIn } from 'lucide-react';
import { trackLiveEvent } from '../services/liveTrafficTracker';

export const ProductDetailsView: React.FC = () => {
  const {
    selectedProductId,
    products,
    reviews,
    addReview,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    setCurrentView,
    currentUser,
    currentAffiliate,
    addNotification
  } = useApp();

  // Find selected product
  const product = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [activeImage, setActiveImage] = useState('');
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // New Review Form State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const galleryList = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) return product.images;
    return product.image ? [product.image] : ['https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80'];
  }, [product]);

  const currentGalleryIndex = useMemo(() => {
    const idx = galleryList.indexOf(activeImage);
    return idx >= 0 ? idx : 0;
  }, [galleryList, activeImage]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setIsVideoActive(false);
      setQuantity(1);
      setNewComment('');
      setNewRating(5);
    }
  }, [product?.id]);

  // Dynamically update document head tags for fast SEO ranking
  useEffect(() => {
    if (!product) return;

    // 1. Title Tag
    const originalTitle = document.title;
    if (product.seoTitle) {
      document.title = product.seoTitle;
    } else {
      document.title = `${product.name} | Pak-Tajarat Online Shop`;
    }

    // 2. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', product.seoDescription || product.description);

    // 3. Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    const originalKeywords = metaKeywords ? metaKeywords.getAttribute('content') : '';
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', product.seoKeywords || `${(product?.name || '').toLowerCase()}, online shopping pakistan`);

    // Clean up on unmount
    return () => {
      document.title = originalTitle;
      if (metaDesc) {
        if (originalDesc) {
          metaDesc.setAttribute('content', originalDesc);
        } else {
          metaDesc.remove();
        }
      }
      if (metaKeywords) {
        if (originalKeywords) {
          metaKeywords.setAttribute('content', originalKeywords);
        } else {
          metaKeywords.remove();
        }
      }
    };
  }, [product]);

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-gray-500">No product selected.</p>
        <button onClick={() => setCurrentView('products')} className="bg-[#0F9D58] text-white px-6 py-2.5 rounded-xl font-bold">
          Back to Shop
        </button>
      </div>
    );
  }

  // Related products (same category, exclude current)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Filter reviews for this product
  const productReviews = reviews.filter(r => r.productId === product.id);

  const isLiked = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  // Live product view tracking
  useEffect(() => {
    if (product) {
      trackLiveEvent(
        'page_view', 
        `Viewed Product: ${product.name} (Rs. ${product.price.toLocaleString()})`, 
        'product_details', 
        { productId: product.id, price: product.price, category: product.category },
        currentUser
      );
    }
  }, [product?.id]);

  const incrementQty = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    trackLiveEvent(
      'add_to_cart', 
      `Added to Cart: ${product.name} (Qty: ${quantity}, Rs. ${(product.price * quantity).toLocaleString()})`, 
      'product_details', 
      { productId: product.id, quantity, price: product.price },
      currentUser
    );
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    trackLiveEvent(
      'buy_now', 
      `Clicked Buy Now: ${product.name} (Qty: ${quantity}, Rs. ${(product.price * quantity).toLocaleString()})`, 
      'product_details', 
      { productId: product.id, quantity, price: product.price },
      currentUser
    );
    setCurrentView('cart');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addReview(product.id, newRating, newComment);
      setNewComment('');
      setNewRating(5);
      setActiveTab('reviews'); // Switch to reviews tab to view immediately
    }
  };

  return (
    <div className="w-full pb-16 animate-in fade-in duration-300" id="product-details-container">
      
      {/* Breadcrumbs */}
      <div className="text-xs sm:text-sm text-gray-500 mb-6 flex items-center space-x-1.5 flex-wrap">
        <button onClick={() => setCurrentView('home')} className="hover:text-[#0F9D58] font-semibold">Home</button>
        <span>/</span>
        <button onClick={() => setCurrentView('products')} className="hover:text-[#0F9D58] font-semibold">Shop Catalog</button>
        <span>/</span>
        <span className="text-[#0F9D58] font-bold truncate max-w-[150px] sm:max-w-[250px]">{product.name}</span>
      </div>

      {/* Main product gallery and configuration card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[32px] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 shadow-sm mb-12">
        
        {/* Left Grid: Images block */}
        <div className="md:col-span-5 space-y-4">
          <div>
            {isVideoActive && product.videoUrl ? (
              <div className="aspect-square w-full bg-black rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm relative">
                <video 
                  src={product.videoUrl || undefined} 
                  controls 
                  autoPlay
                  className="w-full h-full object-contain bg-black"
                />
              </div>
            ) : (
              <ProductImageViewer
                src={(activeImage || product.image) || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80'}
                alt={product.imageAlt || product.name}
                title={product.imageTitle || product.name}
                onOpenLightbox={() => setIsZoomOpen(true)}
              />
            )}
          </div>

          {/* Gallery selector */}
          {((product.images && product.images.length > 0) || product.videoUrl) && (
            <div className="flex flex-wrap gap-2.5">
              {product.images && product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveImage(img);
                    setIsVideoActive(false);
                  }}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-gray-50 dark:bg-zinc-950/80 ${
                    !isVideoActive && (activeImage || product.image) === img ? 'border-[#0F9D58] scale-105 shadow-md' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img src={img || undefined} alt={`Gallery ${index}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=300&q=80'; }} />
                </button>
              ))}

              {/* Video Thumbnail Selector */}
              {product.videoUrl && (
                <button
                  onClick={() => setIsVideoActive(true)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all bg-black flex items-center justify-center relative ${
                    isVideoActive ? 'border-[#0F9D58] scale-105' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                    <Play className="text-[#0F9D58] fill-[#0F9D58]" size={20} />
                  </div>
                  <span className="absolute bottom-1 text-[8px] uppercase tracking-wider text-white font-extrabold bg-black/60 px-1 rounded">
                    Video
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Grid: Configuration block */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6 text-left">
          <div className="space-y-4">
            {/* Category and Badges */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#0F9D58] tracking-widest leading-none">
                {product.category}
              </span>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                    isLiked ? 'bg-red-500 border-red-500 text-white' : 'border-gray-100 dark:border-zinc-800 text-gray-500 hover:text-red-500 hover:bg-red-50'
                  }`}
                  title="Toggle Wishlist"
                >
                  <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => toggleCompare(product.id)}
                  className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                    isCompared ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-100 dark:border-zinc-800 text-gray-500 hover:text-teal-500 hover:bg-teal-50'
                  }`}
                  title="Toggle Comparison"
                >
                  <ArrowLeftRight size={16} />
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Star Rating Metrics */}
            <div className="flex items-center space-x-1.5 pt-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={`${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200 dark:text-zinc-800'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-800 dark:text-zinc-300">
                {product.rating} / 5.0
              </span>
              <span className="text-xs text-gray-400">
                ({productReviews.length} Verified Buyer Reviews)
              </span>
            </div>

            {/* Pricing Details */}
            <div className="bg-gray-50 dark:bg-zinc-950/20 p-4 rounded-3xl border border-gray-100/50 dark:border-zinc-800/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Retail Price</p>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                  Rs. {product.price.toLocaleString()}
                </p>
              </div>
              {product.originalPrice && (
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Original Value</p>
                  <p className="text-lg text-gray-400 line-through mt-1">
                    Rs. {product.originalPrice.toLocaleString()}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-black text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-lg">
                    SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Stock Level Banner */}
            <div className="flex items-center space-x-2 text-xs pt-1">
              {product.stock > 0 ? (
                <div className="flex items-center text-green-600 dark:text-green-400 font-bold">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-ping" />
                  <span>In Stock - Dispatched within 24 hours</span>
                </div>
              ) : (
                <div className="flex items-center text-red-500 font-bold">
                  <ShieldAlert size={14} className="mr-1" />
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            {/* Micro details / Vibe */}
            <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Interactive Configuration Panel */}
          {product.stock > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Select Quantity</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Max available: {product.stock} units</p>
                </div>

                <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-gray-50 dark:bg-zinc-950/20">
                  <button
                    onClick={decrementQty}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 text-sm font-black text-gray-800 dark:text-white">{quantity}</span>
                  <button
                    onClick={incrementQty}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Action trigger row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-[#0F9D58]/10 hover:bg-[#0F9D58] text-[#0F9D58] hover:text-white font-extrabold text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ShoppingCart size={18} />
                  <span>Add to Shopping Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Buy Now (Express)</span>
                </button>
              </div>

            </div>
          )}

          {/* Complete Affiliate Promotion Widget */}
          {currentAffiliate && currentAffiliate.status === 'active' && product.affiliateEnabled !== false && (
            <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-[#0F9D58]/10 dark:to-emerald-900/10 p-5 rounded-3xl border border-[#0F9D58]/15 space-y-3.5 mt-6 animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#0F9D58]">
                  <BadgeCheck size={18} className="fill-[#0F9D58] text-white" />
                  <span className="text-xs font-black uppercase tracking-wider">Associate Partner Perks</span>
                </div>
                <span className="text-[10px] font-black bg-[#0F9D58]/15 text-[#0F9D58] px-2.5 py-1 rounded-full">
                  Active Program
                </span>
              </div>

              <div className="text-xs text-gray-500 dark:text-zinc-400">
                <p>Promote this premium product and earn verified commissions on delivered sales:</p>
                <div className="mt-2.5 grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-zinc-950 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Commission Type</span>
                    <span className="text-sm font-extrabold text-[#0F9D58] capitalize">
                      {product.commissionType === 'fixed' ? 'Fixed Rupee' : 'Percentage Rate'}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Payout Reward</span>
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                      {product.commissionType === 'fixed' 
                        ? `Rs. ${(product.commissionValue || 0).toLocaleString()}` 
                        : `${product.commissionValue || 10}%`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Your Personal Referral Link
                </label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${window.location.origin}/?pid=${product.id}&ref=${currentAffiliate.referralCode}`}
                    className="w-full bg-white dark:bg-zinc-950 border border-gray-150 dark:border-zinc-800 px-3 py-2.5 rounded-xl text-[11px] font-mono text-zinc-600 dark:text-zinc-300 focus:outline-none"
                  />
                  <button 
                    onClick={() => {
                      const link = `${window.location.origin}/?pid=${product.id}&ref=${currentAffiliate.referralCode}`;
                      navigator.clipboard.writeText(link);
                      addNotification('Link Copied!', 'Your personalized affiliate link is copied to your clipboard.', 'success');
                    }}
                    className="p-2.5 bg-[#0F9D58] text-white hover:bg-[#0B7B44] rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                    title="Copy Link to Clipboard"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 italic">
                  Clicks on this link will instantly register on your stats dashboard.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Detailed Description, Specifications, and Reviews Tab system */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[32px] p-6 sm:p-8 shadow-sm mb-12">
        <div className="flex space-x-6 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('desc')}
            className={`text-sm sm:text-base font-extrabold pb-3 relative transition-all cursor-pointer ${
              activeTab === 'desc' ? 'text-[#0F9D58]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Full Description
            {activeTab === 'desc' && <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#0F9D58]" />}
          </button>
          
          <button
            onClick={() => setActiveTab('specs')}
            className={`text-sm sm:text-base font-extrabold pb-3 relative transition-all cursor-pointer ${
              activeTab === 'specs' ? 'text-[#0F9D58]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Technical Specs
            {activeTab === 'specs' && <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#0F9D58]" />}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`text-sm sm:text-base font-extrabold pb-3 relative transition-all cursor-pointer ${
              activeTab === 'reviews' ? 'text-[#0F9D58]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            User Reviews ({productReviews.length})
            {activeTab === 'reviews' && <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#0F9D58]" />}
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'desc' && (
          <div className="space-y-4 animate-in fade-in duration-200 text-left">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Why Choose Pak-Tajarat's {product.name}?</h3>
            <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
              Every detail of the {product.name} is scrutinized and quality-certified by Pak-Tajarat. It delivers exceptional performance, durable build-grade materials, and complies fully with local consumer safety and warranty standards. This purchase qualifies you for 1-year brand support or easy 7-day no-questions refund policies.
            </p>
            <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
              Our direct logistics network ensures that items remain safely cushioned in double-bubble thick carton boxes and checked meticulously right before dispatch from our centralized Blue Area Islamabad packaging facility.
            </p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="animate-in fade-in duration-200">
            <div className="border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800">
              {Object.entries(product.specifications).map(([key, value], specIdx) => (
                <div key={`${key}-${specIdx}`} className="grid grid-cols-1 sm:grid-cols-3 p-4 text-sm text-left">
                  <span className="font-extrabold text-gray-800 dark:text-zinc-300 sm:col-span-1">{key}</span>
                  <span className="text-gray-600 dark:text-zinc-400 sm:col-span-2 mt-1 sm:mt-0">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8 animate-in fade-in duration-200 text-left">
            
            {/* Split layout: Existing reviews & Add review Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Grid: Reviews list */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Verified Customer Feedback</h3>
                
                {productReviews.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No reviews for this product yet. Be the first to share your experience!</p>
                ) : (
                  <div className="space-y-4 divide-y divide-gray-50 dark:divide-zinc-800/50">
                    {productReviews.map((r, rIdx) => (
                      <div key={r.id ? `${r.id}-${rIdx}` : `rev-${rIdx}`} className="pt-4 first:pt-0 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-800 dark:text-white text-sm">{r.userName}</span>
                            <span className="inline-flex items-center text-[10px] text-green-600 dark:text-green-400 font-extrabold uppercase bg-green-50 dark:bg-green-950/25 px-1.5 py-0.5 rounded-md">
                              <BadgeCheck size={10} className="mr-0.5" /> Verified Buyer
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{r.date}</span>
                        </div>

                        {/* Stars */}
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={`${i < r.rating ? 'fill-current' : 'text-gray-200 dark:text-zinc-800'}`} 
                            />
                          ))}
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed italic">
                          "{r.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Grid: Add review form */}
              <div className="lg:col-span-5 bg-gray-50/50 dark:bg-zinc-950/20 border border-gray-100 dark:border-zinc-800/50 rounded-2xl p-6">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Add Your Review</h3>
                
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Star selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Your Rating Selection</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-amber-400 focus:outline-none transform hover:scale-110 transition-transform"
                        >
                          <Star size={22} className={`${star <= newRating ? 'fill-current' : 'text-gray-200 dark:text-zinc-800'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment box */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Write Feedback</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Share your detailed experience with this product's quality, dispatch speed, and overall value..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#0F9D58]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
                  >
                    Submit Verified Review
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Related products recommendation row */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6" id="related-products-section">
          <div className="text-left border-b border-gray-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Related Products
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Recommended items from the same e-commerce index</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p, pIdx) => (
              <ProductCard key={p.id ? `${p.id}-${pIdx}` : `rel-${pIdx}`} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox / Image Zoom Modal */}
      <ImageZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        images={galleryList}
        initialIndex={currentGalleryIndex}
        productName={product.name}
      />

    </div>
  );
};
