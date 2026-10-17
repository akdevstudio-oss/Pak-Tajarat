import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, ShoppingCart, Heart, User, Sun, Moon, 
  Menu, X, Bell, ArrowLeftRight, LogOut,
  ChevronDown, Phone, MessageCircle, MapPin, Tag
} from 'lucide-react';
import { CATEGORIES } from '../data/initialData';
import { Logo } from './Logo';
import { trackLiveEvent } from '../services/liveTrafficTracker';

export const Header: React.FC = () => {
  const {
    darkMode,
    toggleDarkMode,
    currentView,
    setCurrentView,
    currentUser,
    logout,
    cart,
    wishlist,
    compareList,
    notifications,
    markNotificationRead,
    clearNotifications,
    products,
    viewProductDetails,
    isOffline,
    promoBannerEnabled,
    setActiveDashboardTab,
    seoLang,
    setSeoLang,
    isRomanEnglish,
    brandingConfig,
    headerSearchQuery,
    setHeaderSearchQuery,
    executeGlobalSearch
  } = useApp();

  const [searchQuery, setSearchQuery] = useState(headerSearchQuery || '');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(true);
  const [flashSaleTimer, setFlashSaleTimer] = useState({ hours: 14, minutes: 23, seconds: 58 });

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal search input if headerSearchQuery changes from elsewhere
  useEffect(() => {
    if (headerSearchQuery !== undefined && headerSearchQuery !== searchQuery) {
      setSearchQuery(headerSearchQuery);
    }
  }, [headerSearchQuery]);

  // Click outside to close live search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedDesktop = desktopSearchRef.current?.contains(target);
      const clickedMobile = mobileSearchRef.current?.contains(target);

      if (!clickedDesktop && !clickedMobile) {
        setShowSearchResults(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Countdown timer for Flash Sale
  useEffect(() => {
    const interval = setInterval(() => {
      setFlashSaleTimer(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 24, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter products for live search (up to 6 results)
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = trimmedQuery === '' 
    ? [] 
    : products.filter(p => 
        p.name.toLowerCase().includes(trimmedQuery) ||
        p.category.toLowerCase().includes(trimmedQuery) ||
        (p.description && p.description.toLowerCase().includes(trimmedQuery))
      ).slice(0, 6);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotifications = notifications.filter(n => !n.read);

  // Extract brand title & tagline safely
  const rawBrandText = brandingConfig?.customText?.trim() || 'Pak-Tajarat';
  const defaultTagline = "Pakistan's Premier Digital Marketplace & B2B Hub";
  const rawBrandTagline = brandingConfig?.brandTagline?.trim() || defaultTagline;

  let displayTitle = rawBrandText;
  let displayTagline = rawBrandTagline;

  if (rawBrandText.length > 18) {
    if (rawBrandText.toLowerCase().includes('pakistan') || rawBrandText.toLowerCase().includes('marketplace') || rawBrandText.toLowerCase().includes('hub')) {
      const parts = rawBrandText.split(/[-–—:]|\s(?=Pakistan|Premier)/i);
      displayTitle = parts[0]?.trim() || 'Pak-Tajarat';
      const extractedSub = rawBrandText.replace(displayTitle, '').replace(/^[-–—:\s]+/, '').trim();
      if (extractedSub) displayTagline = extractedSub;
    }
  }

  const handleSearchResultClick = (id: string, name: string) => {
    viewProductDetails(id);
    trackLiveEvent('click', `Search Suggestion: ${name}`, 'header_search', { productId: id, productName: name }, currentUser);
    setShowSearchResults(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      if (executeGlobalSearch) {
        executeGlobalSearch(q);
      } else {
        if (setHeaderSearchQuery) setHeaderSearchQuery(q);
        setCurrentView('products');
      }
      trackLiveEvent('search', `Searched: "${q}"`, 'header_search', { query: q }, currentUser);
      setShowSearchResults(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (setHeaderSearchQuery) setHeaderSearchQuery('');
    setShowSearchResults(false);
    if (desktopInputRef.current) desktopInputRef.current.focus();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-gray-800/80 shadow-xs transition-colors duration-300" id="main-header">
      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="w-full bg-amber-600 dark:bg-amber-700 text-white text-[10px] sm:text-xs py-1.5 px-4 flex items-center justify-center space-x-2 font-bold select-none border-b border-amber-500/30" id="offline-mode-banner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>Operating in Offline Mode. Actions will sync automatically when your internet connection is restored.</span>
        </div>
      )}

      {/* Top Bar / Promo Banner */}
      {promoBannerEnabled && (
        <div className="w-full bg-gradient-to-r from-[#0B1B3D] via-[#183661] to-[#0F9D58] text-white text-[10px] sm:text-xs py-1.5 px-3 sm:px-4 flex items-center justify-between shadow-xs border-b border-white/10" id="top-promo-banner">
          <div className="flex items-center space-x-2 sm:space-x-4 truncate">
            <a 
              href="https://wa.me/923261604808" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center font-semibold truncate text-[10px] sm:text-xs hover:text-emerald-200 transition-colors"
            >
              <Phone size={12} className="mr-1 shrink-0 text-emerald-300" /> 
              <span className="hidden xs:inline">Call/WhatsApp: </span>0326-1604808
            </a>
            <span className="hidden sm:inline-block h-3 w-px bg-white/30 shrink-0" />
            <a 
              href="https://wa.me/923261604808" 
              target="_blank" 
              rel="noreferrer"
              className="hidden md:flex items-center font-medium text-emerald-100 hover:text-white transition-colors"
            >
              <MessageCircle size={12} className="mr-1 text-emerald-300" /> WhatsApp Support
            </a>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <span className="font-extrabold uppercase bg-yellow-400 text-gray-950 text-[9px] px-1.5 py-0.5 rounded-md animate-pulse shrink-0">
              Flash Sale
            </span>
            <span className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-yellow-300 font-bold text-[10px] sm:text-xs tracking-wider">
              {String(flashSaleTimer.hours).padStart(2, '0')}:{String(flashSaleTimer.minutes).padStart(2, '0')}:{String(flashSaleTimer.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="bg-white/95 dark:bg-[#121212]/95 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 md:h-18 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo */}
          <button 
            onClick={() => setCurrentView('home')} 
            className="flex items-center space-x-1.5 sm:space-x-2.5 text-left focus:outline-none group cursor-pointer shrink-0 max-w-[50%] xs:max-w-[58%] sm:max-w-none"
            id="brand-logo-btn"
          >
            {brandingConfig?.logoType === 'image' && (brandingConfig?.logoImageUrl || brandingConfig?.websiteLogo) ? (
              <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 min-w-0">
                <img
                  src={brandingConfig.logoImageUrl || brandingConfig.websiteLogo}
                  alt={displayTitle}
                  className="h-8 xs:h-9 sm:h-11 md:h-12 w-auto max-w-[100px] xs:max-w-[130px] sm:max-w-[180px] object-contain transition-transform duration-300 group-hover:scale-105 rounded-lg shrink-0"
                  referrerPolicy="no-referrer"
                />
                {brandingConfig.showText !== false && (
                  <div className="min-w-0 overflow-hidden">
                    <span className="text-sm xs:text-base sm:text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight block truncate">
                      {displayTitle}
                    </span>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 leading-none tracking-wider font-mono uppercase mt-0.5 hidden sm:block max-w-[180px] md:max-w-xs truncate">
                      {displayTagline}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="transition-transform duration-300 group-hover:scale-105 block sm:hidden shrink-0">
                  <Logo size={32} variant="icon" />
                </div>
                <div className="transition-transform duration-300 group-hover:scale-105 hidden sm:block shrink-0">
                  <Logo size={42} variant="icon" />
                </div>
                <div className="min-w-0 overflow-hidden">
                  <span className="text-sm xs:text-base sm:text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight block truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
                    {displayTitle === 'PAK-TAJARAT' || displayTitle === 'Pak-Tajarat' ? (
                      <>Pak-<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600">Tajarat</span></>
                    ) : (
                      displayTitle
                    )}
                  </span>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 leading-none tracking-wider font-mono uppercase mt-0.5 hidden sm:block max-w-[180px] md:max-w-xs truncate">
                    {displayTagline}
                  </p>
                </div>
              </>
            )}
          </button>

          {/* Desktop & Tablet Search Bar (Prominently centered with ample width) */}
          <div 
            ref={desktopSearchRef}
            className="hidden md:flex relative flex-1 min-w-[220px] max-w-xl mx-2 lg:mx-4"
            id="desktop-search-container"
          >
            <form 
              onSubmit={handleSearchSubmit} 
              className="relative w-full flex items-center"
              id="desktop-search-form"
            >
              <div className="relative w-full flex items-center group">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0F9D58] pointer-events-none transition-transform group-focus-within:scale-110" />
                
                <input
                  ref={desktopInputRef}
                  type="text"
                  placeholder="Search products, clothing, tech, books, wholesale..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white dark:bg-zinc-900/90 dark:focus:bg-zinc-900 border border-slate-200/90 dark:border-zinc-700/80 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 rounded-full pl-10 pr-24 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none shadow-xs transition-all duration-200"
                />

                {/* Clear Input Button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full transition-colors"
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}

                {/* Submit Search Button */}
                <button 
                  type="submit" 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#0F9D58] hover:bg-[#0B7B44] text-white text-xs font-bold px-3.5 py-1.5 rounded-full transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                >
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Desktop Search Results Dropdown */}
            {showSearchResults && searchQuery.trim() && (
              <div 
                className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[420px] overflow-y-auto"
              >
                {filteredProducts.length > 0 ? (
                  <>
                    <div className="p-2.5 px-4 text-xs font-semibold text-gray-400 dark:text-zinc-500 bg-gray-50/80 dark:bg-zinc-900/80 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Search size={12} className="text-[#0F9D58]" />
                        <span>Live Product Suggestions</span>
                      </span>
                      <span className="text-[10px] text-[#0F9D58] font-bold bg-[#0F9D58]/10 px-2 py-0.5 rounded-full">
                        {filteredProducts.length} matching
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                      {filteredProducts.map((p, idx) => (
                        <button
                          key={p.id ? `${p.id}-${idx}` : `search-prod-${idx}`}
                          type="button"
                          onClick={() => handleSearchResultClick(p.id, p.name)}
                          className="w-full text-left p-3 hover:bg-emerald-50/40 dark:hover:bg-zinc-800/50 flex items-center space-x-3 transition-colors cursor-pointer group"
                        >
                          <img 
                            src={p.image || undefined} 
                            alt={p.name} 
                            className="w-11 h-11 object-cover rounded-lg border border-gray-100 dark:border-zinc-800 shrink-0 group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="inline-block text-[10px] font-bold text-[#0F9D58] bg-[#0F9D58]/10 px-1.5 py-0.2 rounded uppercase tracking-wider mb-0.5">
                              {p.category}
                            </span>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-[#0F9D58] transition-colors">
                              {p.name}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              Rs. {p.price.toLocaleString()}
                            </p>
                            {p.originalPrice && (
                              <p className="text-[11px] text-gray-400 line-through">
                                Rs. {p.originalPrice.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="w-full text-center py-2.5 px-4 text-xs font-bold text-[#0F9D58] bg-gray-50/50 dark:bg-zinc-900/50 hover:bg-[#0F9D58]/10 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>View all results for "{searchQuery}"</span>
                      <span>→</span>
                    </button>
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      No matching products found for "{searchQuery}"
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try searching with common terms like "shoes", "mobile", "kurti", or "electronics"
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('products');
                        setShowSearchResults(false);
                      }}
                      className="mt-3 inline-flex items-center text-xs font-bold text-[#0F9D58] hover:underline"
                    >
                      Browse all products catalogue →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links (Visible on large screens) */}
          <div className="hidden xl:flex items-center space-x-5 shrink-0">
            <a 
              href="/"
              onClick={(e) => { e.preventDefault(); setCurrentView('home'); }} 
              className={`text-sm font-semibold transition-colors duration-200 ${currentView === 'home' ? 'text-[#0F9D58]' : 'text-gray-600 dark:text-gray-300 hover:text-[#0F9D58]'}`}
            >
              Home
            </a>
            <a 
              href="/products"
              onClick={(e) => { e.preventDefault(); setCurrentView('products'); }} 
              className={`text-sm font-semibold transition-colors duration-200 ${currentView === 'products' ? 'text-[#0F9D58]' : 'text-gray-600 dark:text-gray-300 hover:text-[#0F9D58]'}`}
            >
              Products
            </a>
            <a 
              href="/about"
              onClick={(e) => { e.preventDefault(); setCurrentView('about'); }} 
              className={`text-sm font-semibold transition-colors duration-200 ${currentView === 'about' ? 'text-[#0F9D58]' : 'text-gray-600 dark:text-gray-300 hover:text-[#0F9D58]'}`}
            >
              About
            </a>
            <a 
              href="/blog"
              onClick={(e) => { e.preventDefault(); setCurrentView('blog'); }} 
              className={`text-sm font-semibold transition-colors duration-200 ${currentView === 'blog' || currentView === 'blog-details' ? 'text-[#0F9D58]' : 'text-gray-600 dark:text-gray-300 hover:text-[#0F9D58]'}`}
            >
              Blog
            </a>
            <a 
              href="/contact"
              onClick={(e) => { e.preventDefault(); setCurrentView('contact'); }} 
              className={`text-sm font-semibold transition-colors duration-200 ${currentView === 'contact' ? 'text-[#0F9D58]' : 'text-gray-600 dark:text-gray-300 hover:text-[#0F9D58]'}`}
            >
              Contact
            </a>
          </div>

          {/* Right Action Icons Group */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            
            {/* Mobile Search Toggle Icon (focuses or scrolls to search bar on mobile) */}
            <button
              onClick={() => {
                setMobileSearchVisible(prev => !prev);
                setTimeout(() => mobileInputRef.current?.focus(), 100);
              }}
              className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-[#0F9D58] hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors md:hidden"
              title="Search"
            >
              <Search size={20} />
            </button>

            {/* Compare Button (Visible on XL screens) */}
            <button
              onClick={() => setCurrentView('products')}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-[#0F9D58] hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors hidden xl:block"
              title="Compare Products"
            >
              <ArrowLeftRight size={20} />
              {compareList.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Wishlist Button (Visible on LG screens) */}
            <button
              onClick={() => {
                if (currentUser) {
                  setCurrentView('profile');
                } else {
                  setCurrentView('auth');
                }
              }}
              className="relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-[#0F9D58] hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors hidden lg:block"
              title="Wishlist"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setCurrentView('cart')}
              className="relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-[#0F9D58] hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0F9D58] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-[#0F9D58] hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-yellow-500 w-2.5 h-2.5 rounded-full animate-bounce" />
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div 
                  className="fixed left-2 right-2 top-1/2 -translate-y-1/2 mx-auto w-auto max-w-md max-h-[calc(100dvh-2rem)] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-[60] overflow-hidden flex flex-col md:absolute md:left-auto md:right-0 md:top-full md:translate-y-0 md:mt-3 md:mx-0 md:w-80 md:max-w-[calc(100vw-1rem)] md:max-h-[70vh]"
                  
                >
                  <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                    <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">Notifications</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-xs text-red-500 hover:text-red-600 font-semibold cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain divide-y divide-gray-100 dark:divide-zinc-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 dark:text-zinc-500 text-sm">
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div 
                          key={n.id ? `${n.id}-${idx}` : `notif-${idx}`} 
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (
                              n.title.toLowerCase().includes('congratulations') || 
                              n.title.toLowerCase().includes('approved') || 
                              n.message.toLowerCase().includes('affiliate')
                            ) {
                              setCurrentView('profile');
                              setActiveDashboardTab('affiliate');
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3.5 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors ${!n.read ? 'bg-green-50/20 dark:bg-[#0F9D58]/5' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-xs font-bold uppercase ${n.type === 'success' ? 'text-green-500' : n.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`}>
                              {n.type}
                            </span>
                            <span className="text-[10px] text-gray-400">{n.date}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{n.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Multilingual SEO Language Switcher (EN, RM, UR) */}
            <div className="hidden lg:flex items-center bg-gray-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-gray-200/80 dark:border-zinc-800 text-[10px] font-black shrink-0">
              <button
                onClick={() => setSeoLang('en')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${seoLang === 'en' ? 'bg-[#0F9D58] text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                title="Standard English"
              >
                EN
              </button>
              <button
                onClick={() => setSeoLang('roman')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${seoLang === 'roman' || isRomanEnglish ? 'bg-[#0F9D58] text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                title="Roman Urdu"
              >
                RM
              </button>
              <button
                onClick={() => setSeoLang('ur')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${seoLang === 'ur' ? 'bg-[#0F9D58] text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                title="اردو"
              >
                اردو
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-[#0F9D58] hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Account Dropdown */}
            <div className="relative">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-1 p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors focus:outline-none cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0F9D58] text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {currentUser.fullName.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown size={14} className="text-gray-500 hidden sm:block" />
                  </button>

                  {/* User Actions Dropdown Menu */}
                  {showUserDropdown && (
                    <div 
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800 animate-in fade-in slide-in-from-top-1 duration-150"
                      onMouseLeave={() => setShowUserDropdown(false)}
                    >
                      <div className="p-3 text-left">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{currentUser.fullName}</p>
                        {currentUser.role === 'Admin' && (
                          <span className="inline-block mt-1 text-[10px] font-extrabold uppercase bg-[#0F9D58]/10 text-[#0F9D58] px-2 py-0.5 rounded-full">
                            Admin Role
                          </span>
                        )}
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => {
                            setCurrentView('profile');
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left p-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                        >
                          <User size={16} />
                          <span>My Dashboard</span>
                        </button>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left p-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                        >
                          <LogOut size={16} />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setCurrentView('auth')}
                  className="bg-[#0F9D58] text-white hover:bg-[#0B7B44] text-xs sm:text-sm font-bold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-md transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full xl:hidden transition-colors cursor-pointer"
              id="mobile-menu-toggle"
              title="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>
        </div>
      </div>

      {/* Dedicated Mobile & Tablet Search Bar Row (Always visible & prominent on mobile screens) */}
      {mobileSearchVisible && (
        <div 
          ref={mobileSearchRef}
          className="block md:hidden px-3 sm:px-4 py-2 bg-white dark:bg-[#141414] border-t border-gray-100 dark:border-zinc-800/80 shadow-xs relative transition-all duration-200"
          id="mobile-search-bar-row"
        >
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0F9D58] pointer-events-none" />
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 dark:text-gray-100 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-[#0F9D58] hover:bg-[#0B7B44] text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs flex items-center space-x-1 cursor-pointer"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Mobile Search Results Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <div 
              className="absolute left-3 right-3 top-full mt-1.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[70vh] overflow-y-auto"
            >
              {filteredProducts.length > 0 ? (
                <>
                  <div className="p-2.5 px-3 text-xs font-semibold text-gray-400 dark:text-zinc-500 bg-gray-50/80 dark:bg-zinc-900/80 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Search size={12} className="text-[#0F9D58]" />
                      <span>Matching Products</span>
                    </span>
                    <span className="text-[10px] text-[#0F9D58] font-bold bg-[#0F9D58]/10 px-2 py-0.5 rounded-full">
                      {filteredProducts.length} items
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                    {filteredProducts.map((p, idx) => (
                      <button
                        key={p.id ? `mobile-${p.id}-${idx}` : `mobile-search-${idx}`}
                        type="button"
                        onClick={() => handleSearchResultClick(p.id, p.name)}
                        className="w-full text-left p-3 hover:bg-emerald-50/40 dark:hover:bg-zinc-800/50 flex items-center space-x-3 transition-colors cursor-pointer group"
                      >
                        <img 
                          src={p.image || undefined} 
                          alt={p.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100 dark:border-zinc-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="inline-block text-[9px] font-bold text-[#0F9D58] bg-[#0F9D58]/10 px-1.5 py-0.2 rounded uppercase tracking-wider mb-0.5">
                            {p.category}
                          </span>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {p.name}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            Rs. {p.price.toLocaleString()}
                          </p>
                          {p.originalPrice && (
                            <p className="text-[10px] text-gray-400 line-through">
                              Rs. {p.originalPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="w-full text-center py-2.5 px-3 text-xs font-bold text-[#0F9D58] bg-gray-50/50 dark:bg-zinc-900/50 hover:bg-[#0F9D58]/10 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>View all matching results for "{searchQuery}" →</span>
                  </button>
                </>
              ) : (
                <div className="p-5 text-center">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    No products found for "{searchQuery}"
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Try searching for another keyword or browse our full catalogue
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('products');
                      setShowSearchResults(false);
                    }}
                    className="mt-2.5 inline-block text-xs font-bold text-[#0F9D58] underline"
                  >
                    View All Products
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu Sidebar / Overlay */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 bg-black/50 z-50 flex" id="mobile-menu-overlay">
          <div className="w-4/5 max-w-xs bg-white dark:bg-[#121212] h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200 border-l-4 border-[#0F9D58]">
            {/* Green Gradient Header Bar */}
            <div className="bg-gradient-to-r from-[#0F9D58] via-[#102B54] to-[#0B1B3D] px-5 py-4 flex items-center justify-between border-b border-[#0F9D58]/20" id="mobile-sidebar-header">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Logo size={36} variant="icon" />
                <div className="min-w-0">
                  <span className="text-lg font-black text-white tracking-tight leading-none block">
                    Pak-<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-100">Tajarat</span>
                  </span>
                  <p className="text-[9px] text-emerald-200/80 font-mono uppercase tracking-wider truncate mt-0.5">
                    {displayTagline}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0 cursor-pointer"
                id="close-sidebar-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col space-y-6 overflow-y-auto flex-1">
              {/* Mobile Drawer Search */}
              <form 
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setMobileMenuOpen(false);
                }} 
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-[#0F9D58] shadow-sm text-slate-800 dark:text-gray-100 placeholder-slate-400"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F9D58] cursor-pointer">
                  <Search size={16} />
                </button>
              </form>

              {/* Mobile Multilingual Language Switcher */}
              <div className="bg-gray-50 dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-200/60 dark:border-zinc-800">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1.5">Select Language / زبان منتخب کریں</p>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-bold text-center">
                  <button
                    onClick={() => setSeoLang('en')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${seoLang === 'en' ? 'bg-[#0F9D58] text-white shadow-xs' : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setSeoLang('roman')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${seoLang === 'roman' || isRomanEnglish ? 'bg-[#0F9D58] text-white shadow-xs' : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'}`}
                  >
                    Roman Urdu
                  </button>
                  <button
                    onClick={() => setSeoLang('ur')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${seoLang === 'ur' ? 'bg-[#0F9D58] text-white shadow-xs' : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'}`}
                  >
                    اردو
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col space-y-4 font-semibold text-gray-700 dark:text-gray-300">
                <a 
                  href="/"
                  onClick={(e) => { e.preventDefault(); setCurrentView('home'); setMobileMenuOpen(false); }}
                  className="text-left py-2 border-b border-gray-50 dark:border-zinc-800 hover:text-[#0F9D58] transition-colors"
                >
                  Home
                </a>
                <a 
                  href="/products"
                  onClick={(e) => { e.preventDefault(); setCurrentView('products'); setMobileMenuOpen(false); }}
                  className="text-left py-2 border-b border-gray-50 dark:border-zinc-800 hover:text-[#0F9D58] transition-colors"
                >
                  All Products
                </a>
                <a 
                  href="/about"
                  onClick={(e) => { e.preventDefault(); setCurrentView('about'); setMobileMenuOpen(false); }}
                  className="text-left py-2 border-b border-gray-50 dark:border-zinc-800 hover:text-[#0F9D58] transition-colors"
                >
                  About Company
                </a>
                <a 
                  href="/blog"
                  onClick={(e) => { e.preventDefault(); setCurrentView('blog'); setMobileMenuOpen(false); }}
                  className="text-left py-2 border-b border-gray-50 dark:border-zinc-800 hover:text-[#0F9D58] transition-colors"
                >
                  Educational Blogs
                </a>
                <a 
                  href="/contact"
                  onClick={(e) => { e.preventDefault(); setCurrentView('contact'); setMobileMenuOpen(false); }}
                  className="text-left py-2 border-b border-gray-50 dark:border-zinc-800 hover:text-[#0F9D58] transition-colors"
                >
                  Contact Support
                </a>
              </div>

              {/* Shop Categories Quick Links */}
              <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium mb-3">
                  <Tag size={12} className="text-[#0F9D58]" />
                  <span>Shop Categories</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-zinc-400">
                  {CATEGORIES.slice(0, 6).map((cat, idx) => (
                    <button 
                      key={`${cat}-${idx}`} 
                      onClick={() => { 
                        if (setHeaderSearchQuery) setHeaderSearchQuery(cat);
                        setCurrentView('products'); 
                        setMobileMenuOpen(false); 
                      }}
                      className="text-left hover:text-[#0F9D58] py-1 cursor-pointer flex items-center justify-between"
                    >
                      <span>{cat}</span>
                      <span className="text-gray-300 dark:text-zinc-600 text-xs">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin size={14} className="text-[#0F9D58]" />
                <span className="text-xs text-gray-500">Deliver to Pakistan</span>
              </div>
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer"
                title="Toggle Theme"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
