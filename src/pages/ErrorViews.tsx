import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Home, ArrowLeft, RefreshCw, AlertTriangle, HelpCircle, ShoppingBag, Search, Compass, BookOpen, MessageSquare, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';

export const NotFoundView: React.FC = () => {
  const { products, setCurrentView, setHeaderSearchQuery, executeGlobalSearch } = useApp();
  const [localQuery, setLocalQuery] = useState('');

  // Select 4 recommended products to display on 404 page
  const recommendedProducts = products && products.length > 0 
    ? products.filter(p => p.isFeatured || p.isBestSeller).slice(0, 4)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      if (executeGlobalSearch) {
        executeGlobalSearch(localQuery.trim());
      } else {
        setHeaderSearchQuery(localQuery.trim());
        setCurrentView('products');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-300">
      
      {/* Branded 404 Card container */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[32px] p-8 md:p-10 shadow-xl space-y-8"
        id="branded-404-card"
      >
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-[#0F9D58]/10 blur-xl rounded-full w-24 h-24 mx-auto" />
          <div className="relative p-5 bg-emerald-50 dark:bg-emerald-950/20 text-[#0F9D58] rounded-full">
            <AlertTriangle size={52} className="animate-bounce" />
          </div>
        </div>

        <div className="space-y-3 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-[#0F9D58] font-mono bg-emerald-500/10 px-4 py-1.5 rounded-full">
            404 Error • صفحہ نہیں ملا
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Lost in the Marketplace?
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            The page you are looking for has been moved, removed, or doesn't exist in our Pak-Tajarat directory. Let's get you back to buying verified quality products.
          </p>
        </div>

        {/* 404 Page Custom Search Box */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md mx-auto w-full" id="404-search-form">
          <input
            type="text"
            placeholder="Search high-quality electronics, local fashion..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-[#0F9D58] focus:ring-4 focus:ring-[#0F9D58]/10 rounded-full pl-5 pr-12 py-3.5 text-sm text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none shadow-inner transition-all duration-200"
          />
          <button 
            type="submit" 
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 bg-[#0F9D58] hover:bg-[#0B7B44] text-white rounded-full transition-all shadow"
          >
            <Search size={16} />
          </button>
        </form>

        {/* Dynamic Branded Quick-Links / Helpful Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto text-xs font-bold" id="404-navigation-links">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center space-x-2 p-3 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl transition-all border border-slate-100 dark:border-zinc-800 text-left"
          >
            <Home size={14} className="text-[#0F9D58]" />
            <span>Market Home</span>
          </button>
          
          <button
            onClick={() => setCurrentView('products')}
            className="flex items-center space-x-2 p-3 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl transition-all border border-slate-100 dark:border-zinc-800 text-left"
          >
            <ShoppingBag size={14} className="text-[#0F9D58]" />
            <span>All Products</span>
          </button>

          <button
            onClick={() => setCurrentView('blog')}
            className="flex items-center space-x-2 p-3 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl transition-all border border-slate-100 dark:border-zinc-800 text-left"
          >
            <BookOpen size={14} className="text-[#0F9D58]" />
            <span>Sourcing Blogs</span>
          </button>

          <button
            onClick={() => setCurrentView('faq')}
            className="flex items-center space-x-2 p-3 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl transition-all border border-slate-100 dark:border-zinc-800 text-left"
          >
            <Compass size={14} className="text-[#0F9D58]" />
            <span>FAQs & Help</span>
          </button>

          <button
            onClick={() => setCurrentView('affiliate-portal')}
            className="flex items-center space-x-2 p-3 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl transition-all border border-slate-100 dark:border-zinc-800 text-left"
          >
            <ShieldCheck size={14} className="text-[#0F9D58]" />
            <span>Earn Money</span>
          </button>

          <button
            onClick={() => setCurrentView('contact')}
            className="flex items-center space-x-2 p-3 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl transition-all border border-slate-100 dark:border-zinc-800 text-left"
          >
            <MessageSquare size={14} className="text-[#0F9D58]" />
            <span>Live Support</span>
          </button>
        </div>

        {/* Navigation Control Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="flex-1 flex items-center justify-center space-x-2 px-5 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-zinc-200 rounded-xl text-xs font-bold cursor-pointer transition-all border border-gray-200/50 dark:border-zinc-700/50"
          >
            <ArrowLeft size={16} />
            <span>Go Back Previous Page</span>
          </button>

          <button
            onClick={() => setCurrentView('home')}
            className="flex-1 flex items-center justify-center space-x-2 px-5 py-3.5 bg-[#0F9D58] hover:bg-[#0B7B44] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            <Home size={16} />
            <span>Return Home</span>
          </button>
        </div>

        <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
          <HelpCircle size={14} className="text-gray-400" />
          <span>Need help? <button onClick={() => setCurrentView('contact')} className="text-[#0F9D58] hover:underline cursor-pointer font-bold">Contact Support</button></span>
        </div>
      </motion.div>

      {/* Recommended/Related Products Section */}
      {recommendedProducts.length > 0 && (
        <div className="w-full space-y-6" id="404-recommended-products">
          <div className="text-center space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Recommended Products for You
            </h2>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider font-mono">
              ⚡ verified premium deals • free shipping ⚡
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {recommendedProducts.map((product, idx) => (
              <ProductCard key={product.id ? `${product.id}-${idx}` : `err-rec-${idx}`} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ErrorBoundaryProps {
  error?: Error;
  resetError?: () => void;
}

export const InternalServerErrorView: React.FC<ErrorBoundaryProps> = ({ error, resetError }) => {
  const { setCurrentView } = useApp();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-6"
      >
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/5 blur-xl rounded-full w-24 h-24 mx-auto" />
          <div className="relative p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full">
            <AlertTriangle size={48} className="animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-500 font-mono bg-amber-500/10 px-3 py-1 rounded-full">
            500 Error • سسٹم کی خرابی
          </span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Unexpected Halt
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
            A temporary system hitch occurred on our end. Rest assured, our core engineering team is optimizing the database right now.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800/80 text-left space-y-1.5">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Technical Diagnostic Log</p>
            <pre className="font-mono text-[11px] text-red-500 dark:text-red-400 whitespace-pre-wrap break-all max-h-32 overflow-y-auto bg-white dark:bg-zinc-900/40 p-2 rounded-lg border border-gray-200/40 dark:border-zinc-800/40">
              {error.message || 'Unknown system exception.'}
            </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              if (resetError) {
                resetError();
              } else {
                window.location.reload();
              }
            }}
            className="flex-1 flex items-center justify-center space-x-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            <RefreshCw size={16} />
            <span>Reload Marketplace</span>
          </button>

          <button
            onClick={() => setCurrentView('home')}
            className="flex-1 flex items-center justify-center space-x-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-zinc-200 rounded-xl text-xs font-bold cursor-pointer transition-all border border-gray-200/50 dark:border-zinc-700/50"
          >
            <Home size={16} />
            <span>Back to Safety</span>
          </button>
        </div>

        <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
          <HelpCircle size={14} className="text-gray-400" />
          <span>If error persists, contact support at <a href="mailto:support@pak-tajarat.store" className="text-amber-500 hover:underline">support@pak-tajarat.store</a></span>
        </div>
      </motion.div>
    </div>
  );
};
