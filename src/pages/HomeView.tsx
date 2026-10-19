import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../data/initialData';
import { 
  ArrowRight, Sparkles, TrendingUp, ShoppingBag, 
  ChevronRight, Star, MessageSquare, ShieldCheck, 
  Truck, ArrowUpRight, Calendar, Clock, BookOpen
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { products, setCurrentView, viewProductDetails, heroBanners, blogs } = useApp();

  const now = Date.now();
  const activeProducts = products.filter(p => {
    if (p.status === 'draft') return false;
    if (p.status === 'scheduled' && p.scheduledPublishDate) {
      return new Date(p.scheduledPublishDate).getTime() <= now;
    }
    return true;
  });

  const featuredProducts = activeProducts.filter(p => p.isFeatured).slice(0, 4);
  const bestSellers = activeProducts.filter(p => p.isBestSeller).slice(0, 4);
  const newArrivals = activeProducts.filter(p => p.isNewArrival).slice(0, 4);
  const flashSaleProducts = activeProducts.filter(p => p.isFlashSale).slice(0, 3);

  // Show the real catalog product instead of promotional/demo products.
  const banners = activeProducts.length > 0 ? [{
    id: 'real-product',
    title: "Carry Confidence. Go Further.",
    subtitle: "One backpack. Every journey.",
    description: "Made in Pakistan for work, study, and travel.",
    gradient: "from-emerald-800 to-teal-950",
    image: activeProducts[0].image,
    badge: "MADE FOR YOUR NEXT MOVE"
  }] : [{
    id: 'empty-catalog',
    title: "Pak-Tijarat",
    subtitle: "Pakistan's Trusted Digital Marketplace",
    description: "Our next products will be added by the store admin.",
    gradient: "from-emerald-800 to-teal-950",
    image: "",
    badge: "COMING SOON"
  }];

  const [activeBanner, setActiveBanner] = useState(0);

  // Auto-slide effect for banner images
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Category Icons Mock (Matching labels to categories)
  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case 'Electronics': return '⚡';
      case 'Fashion': return '👔';
      case 'Home & Kitchen': return '🍳';
      case 'Beauty': return '💄';
      case 'Grocery': return '🍎';
      case 'Mobile Accessories': return '📱';
      case 'Sports': return '🏏';
      case 'Toys': return '🧸';
      case 'Books': return '📚';
      default: return '🛍️';
    }
  };

  // Static Reviews for Pak-Tajarat
  const customerReviews: { name: string; city: string; text: string; rating: number; avatar: string }[] = [];

  return (
    <div className="w-full space-y-12 sm:space-y-16 pb-16 animate-in fade-in duration-300" id="home-view-container">
      
      {/* 1. Hero Carousel Banner Section */}
      <section className="relative w-full overflow-hidden" id="hero-slider">
        <div className={`w-full bg-gradient-to-r ${banners[activeBanner].gradient} text-white rounded-3xl md:rounded-[40px] shadow-xl overflow-hidden min-h-[460px] md:min-h-[520px] flex items-center relative`}>
          
          {/* Background pattern */}
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-16 relative z-10 w-full items-center">
            
            {/* Banner Text details */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center space-x-1 bg-emerald-950/45 text-emerald-300 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-emerald-500/25">
                <Sparkles size={12} className="text-emerald-400" />
                <span>{banners[activeBanner].badge}</span>
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white animate-in slide-in-from-bottom duration-300">
                {banners[activeBanner].title}
              </h1>

              <p className="text-lg md:text-xl font-bold text-emerald-100/90 leading-normal">
                {banners[activeBanner].subtitle}
              </p>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                {banners[activeBanner].description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => setCurrentView('products')}
                  className="bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg hover:shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center space-x-2"
                >
                  <ShoppingBag size={18} />
                  <span>Explore Backpack</span>
                </button>
                <button
                  onClick={() => setCurrentView('about')}
                  className="bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-full transition-all duration-200 border border-white/20 flex items-center space-x-1"
                >
                  <span>Our Story</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Banner Illustration/Photo */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <img
                  src={banners[activeBanner].image || undefined}
                  alt={banners[activeBanner].title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>
          </div>

          {/* Carousel Dot Selectors */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBanner(idx)}
                className={`w-3 h-3 rounded-full transition-all ${activeBanner === idx ? 'bg-[#0F9D58] w-8' : 'bg-white/30 hover:bg-white/50'}`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Promo Small Info row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6" id="usp-badges">
        <div className="bg-emerald-50/50 dark:bg-[#0F9D58]/5 border border-emerald-100/50 dark:border-[#0F9D58]/10 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-[#0F9D58]/10 text-[#0F9D58] rounded-xl font-bold">
            <Truck size={22} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Nationwide Cash on Delivery</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pay safely at your doorstep anywhere in Pak.</p>
          </div>
        </div>

        <div className="bg-emerald-50/50 dark:bg-[#0F9D58]/5 border border-emerald-100/50 dark:border-[#0F9D58]/10 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-[#0F9D58]/10 text-[#0F9D58] rounded-xl">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Verified Product Warranty</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Shop 100% genuine checked imports.</p>
          </div>
        </div>

        <div className="bg-emerald-50/50 dark:bg-[#0F9D58]/5 border border-emerald-100/50 dark:border-[#0F9D58]/10 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-[#0F9D58]/10 text-[#0F9D58] rounded-xl">
            <TrendingUp size={22} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Unmatched Price-Value</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Direct partnership with local craftsmen.</p>
          </div>
        </div>
      </section>

      {/* 3. Browse Categories Grid */}
      <section className="space-y-6" id="categories-grid">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-black uppercase text-[#0F9D58] tracking-widest leading-none">Collections</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-1.5">
              Browse Categories
            </h2>
          </div>
          <button 
            onClick={() => setCurrentView('products')}
            className="text-sm font-bold text-[#0F9D58] hover:text-[#0B7B44] flex items-center space-x-1"
          >
            <span>See All</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
          {Array.from(new Set<string>(activeProducts.map(p => String(p.category ?? '')))).map((cat, idx) => (
            <button
              key={`${cat}-${idx}`}
              onClick={() => setCurrentView('products')}
              className="group bg-gray-50 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-zinc-800 border border-gray-100/50 dark:border-zinc-800 rounded-3xl p-4 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-950 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                {getCategoryEmoji(cat)}
              </div>
              <span className="text-xs font-extrabold text-gray-800 dark:text-zinc-300 mt-3 group-hover:text-[#0F9D58] transition-colors line-clamp-1">
                {cat}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Flash Sale / Hot Offers Row */}
      {flashSaleProducts.length > 0 && (
        <section className="bg-red-500/5 dark:bg-red-500/5 border border-red-500/10 rounded-3xl p-6 sm:p-8 space-y-6" id="flash-sale-section">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500 text-white font-black text-xs uppercase px-2.5 py-1 rounded-lg tracking-wider animate-pulse">
                Hot Flash
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Super Flash Deals
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Highly discounted products. Limited quantities left!</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashSaleProducts.map((p, idx) => (
              <div key={p.id ? `${p.id}-${idx}` : `flash-${idx}`} className="relative bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-red-500/5 shadow-sm flex items-center space-x-4">
                <img
                  src={p.image || undefined}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  className="w-24 h-24 object-cover rounded-xl border border-gray-100 dark:border-zinc-800 cursor-pointer"
                  onClick={() => viewProductDetails(p.id)}
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-red-500 tracking-wide">
                    {p.category}
                  </span>
                  <h3 
                    className="text-sm font-bold text-gray-800 dark:text-white truncate cursor-pointer hover:text-[#0F9D58]"
                    onClick={() => viewProductDetails(p.id)}
                  >
                    {p.name}
                  </h3>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-black text-gray-900 dark:text-white">Rs. {p.price.toLocaleString()}</span>
                    {p.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">Rs. {p.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  
                  {/* Stock Left Gauge */}
                  <div className="space-y-1 pt-1.5">
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                      <span>Available Stock: {p.stock} units</span>
                      <span className="text-red-500">Almost Sold!</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-500 h-full rounded-full" 
                        style={{ width: `${(p.stock / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Featured Products Grid */}
      <section className="space-y-6" id="featured-products">
        <div className="text-center max-w-lg mx-auto">
          <span className="text-xs font-black uppercase text-[#0F9D58] tracking-widest leading-none">Selected Just For You</span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-1">
            Featured Products
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Premium-grade, handpicked products curated directly by the Pak-Tajarat vetting team.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p, idx) => (
            <ProductCard key={p.id ? `${p.id}-${idx}` : `feat-${idx}`} product={p} />
          ))}
        </div>
      </section>

      {/* 6. Dynamic Promotional Banner */}
      {activeProducts.length > 1 && <section className="relative w-full overflow-hidden rounded-3xl" id="promo-callout">
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-8 md:p-12 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 relative">
          <div className="space-y-3 max-w-xl text-left">
            <span className="bg-yellow-500 text-gray-900 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">
              Limited Offer Code
            </span>
            <h3 className="text-xl sm:text-3xl font-black leading-tight">
              Get Extra 20% Off Your First Order!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Use checkout promo code <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-yellow-300 font-extrabold tracking-widest">PAK20</span> on any orders above Rs. 3,000. Verified fast shipping, safe packaging guaranteed.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('products')}
            className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <span>Activate Offer Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>}

      {/* 7. New Arrivals & Best Sellers split tabs */}
      {activeProducts.length > 1 && <section className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="arrivals-bestsellers-split">
        
        {/* Best Sellers Column */}
        <div className="space-y-6">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="text-[#0F9D58]" size={20} />
              <span>Best Selling Products</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bestSellers.map((p, idx) => (
              <ProductCard key={p.id ? `${p.id}-${idx}` : `best-${idx}`} product={p} />
            ))}
          </div>
        </div>

        {/* New Arrivals Column */}
        <div className="space-y-6">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="text-[#0F9D58]" size={20} />
              <span>New Arrivals</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {newArrivals.map((p, idx) => (
              <ProductCard key={p.id ? `${p.id}-${idx}` : `new-${idx}`} product={p} />
            ))}
          </div>
        </div>

      </section>}

      {/* 8. Verified Reviews Section */}
      {customerReviews.length > 0 && <section className="space-y-6" id="customer-reviews">
        <div className="text-center max-w-lg mx-auto">
          <span className="text-xs font-black uppercase text-[#0F9D58] tracking-widest leading-none">Pakistan-Wide Feedback</span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-1">
            What Customers Are Saying
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Real feedback from verified purchasers in Islamabad, Lahore, Karachi, Rawalpindi, and Peshawar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {customerReviews.map((rev, index) => (
            <div 
              key={`rev-${index}`}
              className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100/50 dark:border-zinc-800 relative space-y-4"
            >
              {/* Quote marks representation */}
              <div className="text-[#0F9D58] text-4xl font-serif absolute top-4 right-6 opacity-20">”</div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow">
                  {rev.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">{rev.name}</h4>
                  <p className="text-xs text-gray-400">{rev.city}, Pakistan</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex text-amber-400">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-current" />
                ))}
              </div>

              <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed italic">
                "{rev.text}"
              </p>
            </div>
          ))}
        </div>
      </section>}

      {/* 9. Latest Educational Insights & Sourcing Guides Section */}
      {blogs && blogs.length > 0 && (
        <section className="space-y-8 border-t border-gray-100 dark:border-zinc-800/85 pt-12" id="home-educational-blogs">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="text-left space-y-1">
              <span className="text-xs font-black uppercase text-[#0F9D58] tracking-widest leading-none flex items-center space-x-1">
                <BookOpen size={14} />
                <span>Tajarat Education Hub</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Latest Sourcing Guides & Insights
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                Expert-written retail, wholesale, and logistics checklists to grow your trade business across Pakistan and rank higher on search engines.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('blog')}
              className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-[#0F9D58] hover:text-[#0B7B44] transition-colors border border-gray-200 hover:border-[#0F9D58] px-5 py-2.5 rounded-full dark:border-zinc-850 self-start md:self-auto cursor-pointer"
            >
              <span>Explore All Guides</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.filter(b => b.isPublished).slice(0, 3).map((blog, bIdx) => {
              // Custom category badges
              let catBg = 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
              if (blog.category === 'Sourcing Guides') {
                catBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
              } else if (blog.category === 'Business Guides') {
                catBg = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
              }

              return (
                <article 
                  key={blog.id ? `${blog.id}-${bIdx}` : `blog-${bIdx}`} 
                  className="group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col hover:shadow-lg transition-all duration-300 text-left"
                >
                  <div className="aspect-[16/10] overflow-hidden relative bg-gray-100 dark:bg-zinc-850">
                    <img 
                      src={blog.coverImage} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${catBg}`}>
                        {blog.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 text-[11px] text-gray-400 dark:text-zinc-500 font-bold">
                        <span className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>{new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-zinc-700" />
                        <span className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{blog.readTime}</span>
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#0F9D58] transition-colors text-sm sm:text-base">
                        {blog.title}
                      </h3>

                      <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        localStorage.setItem('pak_tajarat_selected_blog_slug', blog.slug);
                        setCurrentView('blog-details');
                      }}
                      className="inline-flex items-center space-x-1 text-xs font-black text-[#0F9D58] hover:text-[#0B7B44] transition-colors self-start group/btn cursor-pointer"
                    >
                      <span>Read Full Guide</span>
                      <ArrowRight size={14} className="transform group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
};
