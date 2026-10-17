import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  ActiveView, Product, AppNotification, LogoConfig, SiteBrandingConfig, 
  CategoryItem, MediaItem, SeoConfig, HeroBanner, BlogPost, WorkerAccount 
} from '../../shared/types';
import { DEFAULT_BRANDING_CONFIG, DEFAULT_SITE_CATEGORIES, DEFAULT_SEO_CONFIG } from '../../data/initialData';
import { applySeoAndBrandingToHead } from '../../utils/seoManager';
import { getInitialRoute } from '../../utils/seo';

export interface UIContextType {
  // Theme
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;

  // Navigation & View
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  selectedProductId: string | null;
  viewProductDetails: (productId: string) => void;
  activeDashboardTab: 'profile' | 'orders' | 'wishlist' | 'addresses' | 'notifications' | 'settings' | 'affiliate';
  setActiveDashboardTab: (tab: 'profile' | 'orders' | 'wishlist' | 'addresses' | 'notifications' | 'settings' | 'affiliate') => void;

  // Notifications
  notifications: AppNotification[];
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Quick View Modal
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  // Logo & Branding CMS
  logoConfig: LogoConfig;
  updateLogoConfig: (config: Partial<LogoConfig>) => Promise<void>;
  brandingConfig: SiteBrandingConfig;
  updateBrandingConfig: (config: Partial<SiteBrandingConfig>) => Promise<void>;

  // Category CMS
  siteCategories: CategoryItem[];
  updateSiteCategories: (categories: CategoryItem[]) => Promise<void>;

  // Media Library CMS
  mediaLibrary: MediaItem[];
  addMediaItem: (item: MediaItem) => Promise<void>;
  updateMediaItem: (item: MediaItem) => Promise<void>;
  deleteMediaItem: (id: string) => Promise<void>;

  // SEO Config
  seoConfig: SeoConfig;
  updateSeoConfig: (config: Partial<SeoConfig>) => Promise<void>;

  // Offline state
  isOffline: boolean;

  // Promo Banner
  promoBannerEnabled: boolean;
  updatePromoBannerEnabled: (enabled: boolean) => Promise<void>;

  // Hero Banners
  heroBanners: HeroBanner[];
  updateHeroBanners: (banners: HeroBanner[]) => Promise<void>;

  // Global Search
  headerSearchQuery: string;
  setHeaderSearchQuery: (query: string) => void;
  executeGlobalSearch: (query: string) => void;

  // Multilingual SEO Settings
  seoLang: 'en' | 'ur' | 'roman';
  setSeoLang: (lang: 'en' | 'ur' | 'roman') => void;
  isRomanEnglish: boolean;
  setIsRomanEnglish: (enabled: boolean) => void;

  // Admin identity is read from the authenticated server session.

  // Blog Management
  blogs: BlogPost[];
  addBlog: (blog: BlogPost) => Promise<void>;
  updateBlog: (blog: BlogPost) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;

  // Worker Accounts
  workerAccounts: WorkerAccount[];
  addWorkerAccount: (worker: Omit<WorkerAccount, 'createdAt' | 'role'>) => Promise<void>;
  updateWorkerAccountStatus: (workerId: string, status: 'active' | 'suspended') => Promise<void>;
  deleteWorkerAccount: (workerId: string) => Promise<void>;
  updateWorkerAccountPassword: (workerId: string, newPasskey: string) => Promise<void>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

async function persistCms(collectionName: string, id: string, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', data?: unknown) {
  const query = id ? `?id=${encodeURIComponent(id)}` : '';
  const response = await fetch(`/api/cms/${collectionName}${query}`, {
    method, credentials: 'same-origin',
    headers: data === undefined ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data), cache: 'no-store'
  });
  if (!response.ok) {
    let message = 'Could not save this setting to MongoDB.';
    try { const result = await response.json(); message = result.error || message; } catch {}
    throw new Error(message);
  }
}

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme State
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    return localStorage.getItem('pak_tajarat_darkMode') === 'true';
  });

  // Routing State
  const [currentView, setCurrentViewState] = useState<ActiveView>(() => getInitialRoute().view);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(() => getInitialRoute().productId);
  const [activeDashboardTab, setActiveDashboardTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses' | 'notifications' | 'settings' | 'affiliate'>('profile');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Offline State
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // CMS & Config States
  const [logoConfig, setLogoConfig] = useState<LogoConfig>(() => {
    try {
      const savedBranding = localStorage.getItem('pak_tajarat_branding_config');
      if (savedBranding) {
        const parsed = JSON.parse(savedBranding);
        return {
          sizePreset: 'medium',
          sizeScale: 1.0,
          showText: true,
          variant: 'default',
          customText: parsed.customText || 'PAK-TAJARAT',
          logoType: parsed.logoType || (parsed.logoImageUrl ? 'image' : 'vector'),
          logoImageUrl: parsed.logoImageUrl || '',
          faviconUrl: parsed.faviconUrl || '',
        };
      }
    } catch (_) {}
    return {
      sizePreset: 'medium',
      sizeScale: 1.0,
      showText: true,
      variant: 'default',
      customText: 'PAK-TAJARAT',
      logoType: 'vector',
      logoImageUrl: '',
      faviconUrl: '',
    };
  });

  const [brandingConfig, setBrandingConfig] = useState<SiteBrandingConfig>(() => {
    try {
      const saved = localStorage.getItem('pak_tajarat_branding_config');
      if (saved) {
        return { ...DEFAULT_BRANDING_CONFIG, ...JSON.parse(saved) };
      }
    } catch (_) {}
    return DEFAULT_BRANDING_CONFIG;
  });
  const [siteCategories, setSiteCategories] = useState<CategoryItem[]>(DEFAULT_SITE_CATEGORIES);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [seoConfig, setSeoConfig] = useState<SeoConfig>(DEFAULT_SEO_CONFIG);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [promoBannerEnabled, setPromoBannerEnabled] = useState<boolean>(true);

  // Global Header Search State
  const [headerSearchQuery, setHeaderSearchQuery] = useState<string>('');
  const executeGlobalSearch = useCallback((query: string) => {
    setHeaderSearchQuery(query);
    setCurrentViewState('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Multilingual SEO Language
  const [seoLang, setSeoLangState] = useState<'en' | 'ur' | 'roman'>(() => {
    return (localStorage.getItem('pak_tajarat_seoLang') as 'en' | 'ur' | 'roman') || 'en';
  });
  const [isRomanEnglish, setIsRomanEnglishState] = useState<boolean>(() => {
    return localStorage.getItem('pak_tajarat_isRomanEnglish') === 'true';
  });

  // Worker Accounts State
  const [workerAccounts, setWorkerAccounts] = useState<WorkerAccount[]>([]);

  // Theme effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('pak_tajarat_darkMode', String(darkMode));
  }, [darkMode]);

  const setDarkMode = useCallback((dark: boolean) => setDarkModeState(dark), []);
  const toggleDarkMode = useCallback(() => setDarkModeState(prev => !prev), []);

  // Online / Offline effect
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // SEO & Head application effect
  useEffect(() => {
    applySeoAndBrandingToHead(seoConfig, brandingConfig);
  }, [seoConfig, brandingConfig, currentView, selectedProductId]);

  // Load cloud-managed CMS content from MongoDB, keeping cached settings as a fallback.
  useEffect(() => {
    let active = true;
    fetch('/api/cms/branding', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(result => {
        if (!active || !result?.item) return;
        const merged = { ...DEFAULT_BRANDING_CONFIG, ...result.item } as SiteBrandingConfig;
        setBrandingConfig(merged);
        setLogoConfig(prev => ({
          ...prev, logoImageUrl: merged.logoImageUrl || '',
          logoType: merged.logoType || (merged.logoImageUrl ? 'image' : 'vector'),
          customText: merged.customText || prev.customText, faviconUrl: merged.faviconUrl || ''
        }));
        try { localStorage.setItem('pak_tajarat_branding_config', JSON.stringify(merged)); } catch {}
      })
      .catch(error => console.warn('MongoDB branding fetch unavailable; using local cache.', error));
    fetch('/api/cms/blogs', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(result => {
        if (!active || !Array.isArray(result?.items)) return;
        setBlogs(result.items);

      })
      .catch(error => console.warn('MongoDB blogs fetch unavailable; using local cache.', error));
    fetch('/api/cms/media', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(result => {
        if (!active || !Array.isArray(result?.items)) return;
        setMediaLibrary(result.items);

      })
      .catch(() => {});
    fetch('/api/cms/worker_accounts', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(result => {
        if (!active || !Array.isArray(result?.items)) return;
        setWorkerAccounts(result.items);

      })
      .catch(() => {});
    fetch('/api/cms/categories?id=categories', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(result => {
        if (active && Array.isArray(result?.item?.items)) setSiteCategories(result.item.items);
      })
      .catch(() => {});
    fetch('/api/cms/seo?id=seo', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(result => {
        if (active && result?.item) setSeoConfig({ ...DEFAULT_SEO_CONFIG, ...result.item });
      })
      .catch(() => {});
    fetch('/api/cms/hero_banners?id=hero_banners', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(result => {
        if (active && Array.isArray(result?.item?.items)) setHeroBanners(result.item.items);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Notifications logic
  const addNotification = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      read: false,
      date: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // View navigation logic
  const setCurrentView = useCallback((view: ActiveView) => {
    setCurrentViewState(view);
  }, []);

  // Open a product and update the URL so each product can be shared/bookmarked.
  const viewProductDetails = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setCurrentViewState('details');

    const productPath = `/products/${encodeURIComponent(productId)}`;
    if (typeof window !== 'undefined' && window.location.pathname !== productPath) {
      window.history.pushState({ productId }, '', productPath);
    }
  }, []);

  // Keep the selected view/product in sync with browser Back and Forward.
  useEffect(() => {
    const syncRouteFromUrl = () => {
      let path = window.location.pathname || '/';
      while (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
      const segments = path.split('/').filter(Boolean);
      const isProductPath = segments.length === 2 && (segments[0].toLowerCase() === 'products' || segments[0].toLowerCase() === 'product');
      const productIdFromPath = isProductPath ? segments[1] : null;

      if (productIdFromPath) {
        let productId = productIdFromPath;
        try { productId = decodeURIComponent(productId); } catch { /* use original path segment */ }
        setSelectedProductId(productId);
        setCurrentViewState('details');
      } else if (path.toLowerCase() === '/products' || path.toLowerCase() === '/shop') {
        setSelectedProductId(null);
        setCurrentViewState('products');
      }
    };

    window.addEventListener('popstate', syncRouteFromUrl);
    return () => window.removeEventListener('popstate', syncRouteFromUrl);
  }, []);

  // CMS updaters
  const updateLogoConfig = async (config: Partial<LogoConfig>) => {
    const updated = { ...logoConfig, ...config };
    setLogoConfig(updated);
    try {
      localStorage.setItem('pak_tajarat_logo_config', JSON.stringify(updated));
    } catch (_) {}
    addNotification('Logo Updated 🎨', 'Logo configuration saved successfully.', 'success');
  };

  const updateBrandingConfig = async (config: Partial<SiteBrandingConfig>) => {
    const updated: SiteBrandingConfig = { ...brandingConfig, ...config };
    await persistCms('branding', 'branding', 'PUT', { ...updated, id: 'branding' });
    setBrandingConfig(updated);
    setLogoConfig(prev => ({
      ...prev,
      logoImageUrl: updated.logoImageUrl !== undefined ? (updated.logoImageUrl || '') : prev.logoImageUrl,
      logoType: updated.logoType || (updated.logoImageUrl ? 'image' : 'vector'),
      customText: updated.customText || prev.customText,
      faviconUrl: updated.faviconUrl !== undefined ? (updated.faviconUrl || '') : prev.faviconUrl
    }));
    try { localStorage.setItem('pak_tajarat_branding_config', JSON.stringify(updated)); } catch {}
    applySeoAndBrandingToHead(seoConfig, updated);
    addNotification('Branding Updated 🎨', 'Branding and favicon saved to MongoDB.', 'success');
  };

  const updateSiteCategories = async (categories: CategoryItem[]) => {
    await persistCms('categories', 'categories', 'PUT', { id: 'categories', items: categories });
    setSiteCategories(categories);
    addNotification('Categories Updated 📁', 'Categories saved to MongoDB.', 'success');
  };

  const addMediaItem = async (item: MediaItem) => {
    await persistCms('media', item.id, 'PUT', item);
    setMediaLibrary(prev => [item, ...prev.filter(m => m.id !== item.id)]);
    addNotification('Media Added 🖼️', `Media file ${item.name} uploaded and saved.`, 'success');
  };

  const updateMediaItem = async (item: MediaItem) => {
    await persistCms('media', item.id, 'PUT', item);
    setMediaLibrary(prev => prev.map(m => m.id === item.id ? item : m));
  };

  const deleteMediaItem = async (id: string) => {
    const item = mediaLibrary.find(m => m.id === id);
    if (item?.path) {
      const response = await fetch('/api/media/delete', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: item.path, id: item.id })
      });
      if (!response.ok) {
        let message = 'Could not delete image from Cloudflare R2.';
        try { const result = await response.json(); message = result.error || message; } catch {}
        throw new Error(message);
      }
    } else {
      await persistCms('media', id, 'DELETE');
    }
    setMediaLibrary(prev => prev.filter(m => m.id !== id));
    addNotification('Media Deleted', 'Image removed from the media library and storage.', 'warning');
  };

  const updateSeoConfig = async (config: Partial<SeoConfig>) => {
    const updated = { ...seoConfig, ...config };
    await persistCms('seo', 'seo', 'PUT', { id: 'seo', ...updated });
    setSeoConfig(updated);
    addNotification('SEO Config Updated 🚀', 'SEO settings saved to MongoDB.', 'success');
  };

  const updatePromoBannerEnabled = async (enabled: boolean) => {
    setPromoBannerEnabled(enabled);
  };

  const updateHeroBanners = async (banners: HeroBanner[]) => {
    await persistCms('hero_banners', 'hero_banners', 'PUT', { id: 'hero_banners', items: banners });
    setHeroBanners(banners);
    addNotification('Banners Updated 🖼️', 'Hero banners saved to MongoDB.', 'success');
  };

  const setIsRomanEnglish = (enabled: boolean) => {
    setIsRomanEnglishState(enabled);
    localStorage.setItem('pak_tajarat_isRomanEnglish', enabled ? 'true' : 'false');
    if (enabled) {
      setSeoLangState('roman');
      localStorage.setItem('pak_tajarat_seoLang', 'roman');
      addNotification('Roman English Enabled', 'Language display is now set to Roman English.', 'info');
    } else {
      setSeoLangState('en');
      localStorage.setItem('pak_tajarat_seoLang', 'en');
      addNotification('Standard English Enabled', 'Language display switched to Standard English.', 'success');
    }
  };

  const setSeoLang = (lang: 'en' | 'ur' | 'roman') => {
    setSeoLangState(lang);
    localStorage.setItem('pak_tajarat_seoLang', lang);
    if (lang === 'roman') {
      setIsRomanEnglishState(true);
      localStorage.setItem('pak_tajarat_isRomanEnglish', 'true');
      addNotification('Roman English Selected', 'Mode set to Roman English.', 'info');
    } else if (lang === 'ur') {
      setIsRomanEnglishState(false);
      localStorage.setItem('pak_tajarat_isRomanEnglish', 'false');
      addNotification('SEO زبان تبدیل ہو گئی', 'SEO کی ترتیبات اردو میں سیٹ کر دی گئیں۔', 'success');
    } else {
      setIsRomanEnglishState(false);
      localStorage.setItem('pak_tajarat_isRomanEnglish', 'false');
      addNotification('Standard English Selected', 'Mode set to Standard English.', 'success');
    }
  };

  const cleanUndefinedProps = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(cleanUndefinedProps).filter(v => v !== undefined && v !== null);
    }
    const clean: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        clean[key] = cleanUndefinedProps(val);
      }
    }
    return clean;
  };

  const addBlog = async (blog: BlogPost) => {
    const publishedBlog: BlogPost = { ...blog, status: blog.status || 'Published', isPublished: blog.isPublished !== undefined ? blog.isPublished : true };
    await persistCms('blogs', publishedBlog.id, 'PUT', cleanUndefinedProps(publishedBlog));
    setBlogs(prev => [publishedBlog, ...prev.filter(b => b.id !== publishedBlog.id)]);
    addNotification('Blog Published 📝', `Article "${publishedBlog.title}" saved to MongoDB.`, 'success');
  };

  const updateBlog = async (blog: BlogPost) => {
    const updatedBlog: BlogPost = { ...blog, status: blog.status || 'Published', isPublished: blog.isPublished !== undefined ? blog.isPublished : true };
    await persistCms('blogs', updatedBlog.id, 'PUT', cleanUndefinedProps(updatedBlog));
    setBlogs(prev => prev.map(b => b.id === updatedBlog.id ? updatedBlog : b));
    addNotification('Blog Updated 📝', `Article "${updatedBlog.title}" saved to MongoDB.`, 'success');
  };

  const deleteBlog = async (id: string) => {
    await persistCms('blogs', id, 'DELETE');
    setBlogs(prev => prev.filter(b => b.id !== id));
    addNotification('Blog Deleted', 'Article deleted from MongoDB.', 'warning');
  };

  const addWorkerAccount = async (workerData: Omit<WorkerAccount, 'createdAt' | 'role'>) => {
    const newWorker: WorkerAccount = { ...workerData, role: 'Worker', createdAt: new Date().toISOString() };
    await persistCms('worker_accounts', newWorker.id, 'PUT', newWorker);
    setWorkerAccounts(prev => [...prev.filter(w => w.id !== newWorker.id), newWorker]);
    addNotification('Worker Account Created 🔑', `Worker ${newWorker.workerName} (${newWorker.id}) registered successfully.`, 'success');
  };

  const updateWorkerAccountStatus = async (workerId: string, status: 'active' | 'suspended') => {
    await persistCms('worker_accounts', workerId, 'PATCH', { id: workerId, status });
    setWorkerAccounts(prev => prev.map(w => w.id === workerId ? { ...w, status } : w));
    addNotification('Worker Status Updated', `Worker status set to ${status.toUpperCase()}.`, 'success');
  };

  const deleteWorkerAccount = async (workerId: string) => {
    await persistCms('worker_accounts', workerId, 'DELETE');
    setWorkerAccounts(prev => prev.filter(w => w.id !== workerId));
    addNotification('Worker Account Removed', 'Worker account deleted from MongoDB.', 'warning');
  };

  const updateWorkerAccountPassword = async (workerId: string, newPasskey: string) => {
    await persistCms('worker_accounts', workerId, 'PATCH', { id: workerId, workerPasskey: newPasskey });
    setWorkerAccounts(prev => prev.map(w => w.id === workerId ? { ...w, workerPasskey: newPasskey } : w));
    addNotification('Worker Password Updated', 'Worker password updated in MongoDB.', 'success');
  };

  return (
    <UIContext.Provider value={{
      darkMode, setDarkMode, toggleDarkMode,
      currentView, setCurrentView, selectedProductId, viewProductDetails,
      activeDashboardTab, setActiveDashboardTab,
      notifications, addNotification, markNotificationRead, clearNotifications,
      quickViewProduct, setQuickViewProduct,
      logoConfig, updateLogoConfig,
      brandingConfig, updateBrandingConfig,
      siteCategories, updateSiteCategories,
      mediaLibrary, addMediaItem, updateMediaItem, deleteMediaItem,
      seoConfig, updateSeoConfig,
      isOffline,
      promoBannerEnabled, updatePromoBannerEnabled,
      heroBanners, updateHeroBanners,
      headerSearchQuery, setHeaderSearchQuery, executeGlobalSearch,
      seoLang, setSeoLang, isRomanEnglish, setIsRomanEnglish,
      blogs, addBlog, updateBlog, deleteBlog,
      workerAccounts, addWorkerAccount, updateWorkerAccountStatus, deleteWorkerAccount, updateWorkerAccountPassword
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
