import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BlogPost } from '../types';
import { Calendar, Clock, BookOpen, Search, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { LanguageModeBar } from './PolicyViews';

export const BlogView: React.FC = () => {
  const { blogs, setCurrentView, isRomanEnglish } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLang, setSelectedLang] = useState<'all' | 'en' | 'roman' | 'ur'>('all');

  // Update page metadata for search engines and AI crawlers
  useEffect(() => {
    document.title = "Pakistani E-Commerce & Sourcing Guides Blog | Pak Tajarat";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', "Read high-ranking informational blogs on sourcing products, wholesale trade, and starting online businesses in Pakistan. Master Lahore, Karachi, and Faisalabad markets with Pak Tajarat.");

    // Add BlogPosting list schema for AEO
    const blogSchema = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Pak-Tajarat Education Hub',
      description: 'Expert guides on e-commerce, wholesale sourcing, and online business in Pakistan.',
      url: 'https://pak-tajarat.store/blog',
      publisher: {
        '@type': 'Organization',
        name: 'Pak-Tajarat',
        url: 'https://pak-tajarat.store'
      }
    };
    let script = document.getElementById('blog-ld-json') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'blog-ld-json';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(blogSchema);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { script?.remove(); };
  }, []);

  const categories = ['All', ...Array.from(new Set(blogs?.map(b => b.category) || []))];

  // Filter posts based on parameters
  const filteredBlogs = (blogs || []).filter(blog => {
    if (!blog.isPublished) return false;

    const matchesSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.tags && blog.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;

    const matchesLang = 
      selectedLang === 'all' || 
      blog.language === 'both' || 
      blog.language === selectedLang;

    return matchesSearch && matchesCategory && matchesLang;
  });

  // Dynamic router to view details
  const handleReadBlog = (blog: BlogPost) => {
    // We save the selected blog ID or slug in local storage so App.tsx can retrieve it 
    localStorage.setItem('pak_tajarat_selected_blog_slug', blog.slug);
    setCurrentView('blog-details');
  };

  return (
    <div className="w-full pb-16 space-y-12 animate-in fade-in duration-300 text-left" id="blog-index-view">
        
        {/* Language Mode Checkbox Control Bar */}
        <LanguageModeBar />

        {/* Editorial Title Banner */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles size={12} />
            <span>Tajarat Education Hub</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Knowledge Base for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600">Smart Sourcing</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            Step-by-step guides, market research, and local sourcing tips in Standard English, Roman English, and Urdu. Learn how to grow your wholesale and retail trade businesses across Pakistan.
          </p>
        </div>

        {/* Filters and Search Bar Container */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <input
                type="text"
                placeholder="Search articles, keywords, or guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/10 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none transition-all"
              />
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Language Tabs */}
            <div className="md:col-span-4 flex items-center bg-gray-100/80 dark:bg-zinc-950 p-1 rounded-xl border border-gray-200/40 dark:border-zinc-800">
              <button
                onClick={() => setSelectedLang('all')}
                className={`flex-1 text-center py-2 text-[10px] sm:text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all ${selectedLang === 'all' ? 'bg-[#0F9D58] text-white shadow-xs' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedLang('en')}
                className={`flex-1 text-center py-2 text-[10px] sm:text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all ${selectedLang === 'en' ? 'bg-[#0F9D58] text-white shadow-xs' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                English
              </button>
              <button
                onClick={() => setSelectedLang('roman')}
                className={`flex-1 text-center py-2 text-[10px] sm:text-xs font-extrabold rounded-lg transition-all ${selectedLang === 'roman' ? 'bg-[#0F9D58] text-white shadow-xs' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Roman
              </button>
              <button
                onClick={() => setSelectedLang('ur')}
                className={`flex-1 text-center py-2 text-[10px] sm:text-xs font-extrabold rounded-lg transition-all ${selectedLang === 'ur' ? 'bg-[#0F9D58] text-white shadow-xs' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                اردو
              </button>
            </div>

            {/* Category selection count summary */}
            <div className="md:col-span-3 text-right text-xs text-gray-400 font-extrabold font-mono uppercase">
              Showing {filteredBlogs.length} of {blogs?.filter(b => b.isPublished).length || 0} Posts
            </div>

          </div>

          {/* Categories Pill Scroller */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat, idx) => (
              <button
                key={`${cat}-${idx}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-black rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0F9D58]/10 text-[#0F9D58] border border-[#0F9D58]/20'
                    : 'bg-gray-50 dark:bg-zinc-950 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200/50 dark:border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Featured Big Card (if there are blogs) */}
        {filteredBlogs.length > 0 && searchQuery === '' && selectedCategory === 'All' && selectedLang === 'all' && (
          <div className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center hover:shadow-md transition-shadow">
            <div className="h-64 sm:h-96 w-full overflow-hidden relative">
              <img
                src={filteredBlogs[0].coverImage}
                alt={filteredBlogs[0].title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-emerald-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-lg">
                Featured Article
              </div>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 text-xs text-gray-400 font-bold">
                <span className="text-[#0F9D58] uppercase font-black">{filteredBlogs[0].category}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={13} /> {filteredBlogs[0].readTime}</span>
                <span>•</span>
                <span className="uppercase text-[9px] bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-gray-500">{filteredBlogs[0].language === 'ur' ? 'اردو' : filteredBlogs[0].language === 'en' ? 'English' : 'Urdu & Eng'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-[#0F9D58] transition-colors">
                {filteredBlogs[0].title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3">
                {filteredBlogs[0].excerpt}
              </p>
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold">
                  <span>By {filteredBlogs[0].author}</span>
                  <span>•</span>
                  <span>{filteredBlogs[0].date}</span>
                </div>
                <button
                  onClick={() => handleReadBlog(filteredBlogs[0])}
                  className="text-xs font-black text-[#0F9D58] flex items-center space-x-1 hover:translate-x-1 transition-transform"
                >
                  <span>Read Article</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Regular Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-12 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-950 text-gray-400 rounded-full flex items-center justify-center mx-auto border border-gray-100 dark:border-zinc-800">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">No Matching Articles Found</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                We couldn't find any articles matching your search query or selected language filters. Try adjusting your parameters or search keywords.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLang('all');
              }}
              className="px-4 py-2 bg-[#0F9D58] hover:bg-[#0B7B44] text-white text-xs font-black rounded-lg transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs
              // Skip the first featured card only if no filter is applied to prevent duplicates
              .slice((searchQuery === '' && selectedCategory === 'All' && selectedLang === 'all') ? 1 : 0)
              .map((blog, idx) => (
                <article
                  key={blog.id ? `${blog.id}-${idx}` : `blog-${idx}`}
                  className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#0F9D58]/20 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Card Cover Photo */}
                  <div className="h-48 w-full overflow-hidden relative bg-gray-100 dark:bg-zinc-950">
                    <img
                      src={blog.coverImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80'}
                      alt={blog.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-gray-800 dark:text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded-md shadow-xs border border-gray-100 dark:border-zinc-800">
                      {blog.category}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-bold">
                        <span className="flex items-center gap-1"><Clock size={11} /> {blog.readTime}</span>
                        <span>•</span>
                        <span className="uppercase text-[8px] bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-gray-500">
                          {blog.language === 'ur' ? 'اردو' : blog.language === 'en' ? 'English' : 'Urdu & Eng'}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white group-hover:text-[#0F9D58] transition-colors leading-snug line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-bold">By {blog.author}</span>
                      <button
                        onClick={() => handleReadBlog(blog)}
                        className="font-black text-[#0F9D58] hover:text-[#0b8043] flex items-center space-x-1 hover:translate-x-0.5 transition-transform"
                      >
                        <span>Read</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        )}

    </div>
  );
};
