import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  ActiveView, Product, AppNotification, LogoConfig, SiteBrandingConfig, 
  CategoryItem, MediaItem, SeoConfig, HeroBanner, BlogPost, WorkerAccount 
} from '../../shared/types';
import { DEFAULT_BRANDING_CONFIG, DEFAULT_SITE_CATEGORIES, DEFAULT_SEO_CONFIG, DEFAULT_HERO_BANNERS, INITIAL_BLOGS } from '../../data/initialData';
import { applySeoAndBrandingToHead } from '../../utils/seoManager';
import { getInitialRoute } from '../../utils/seo';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

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

  // Admin Credentials
  adminEmail: string;
  adminPassword?: string;
  updateAdminCredentials: (email: string, password: string) => Promise<void>;

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
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(DEFAULT_HERO_BANNERS);
  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('pak_tajarat_blogs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_BLOGS;
  });
  const [promoBannerEnabled, setPromoBannerEnabled] = useState<boolean>(true);

  // Global Header Search State
  const [headerSearchQuery, setHeaderSearchQuery] = useState<string>('');
  const executeGlobalSearch = useCallback((query: string) => {
    setHeaderSearchQuery(query);
    setCurrentViewState('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Admin Credentials
  const [adminEmail, setAdminEmailState] = useState<string>(() => {
    return localStorage.getItem('pak_tajarat_adminEmail') || 'admin@paktajarat.pk';
  });
  const [adminPassword, setAdminPasswordState] = useState<string>(() => {
    // NOTE: We store only a hashed indicator, never plaintext in production.
    // This is used only for local demo worker login comparison.
    return sessionStorage.getItem('pak_tajarat_adminPassword') || '';
  });

  // Multilingual SEO Language
  const [seoLang, setSeoLangState] = useState<'en' | 'ur' | 'roman'>(() => {
    return (localStorage.getItem('pak_tajarat_seoLang') as 'en' | 'ur' | 'roman') || 'en';
  });
  const [isRomanEnglish, setIsRomanEnglishState] = useState<boolean>(() => {
    return localStorage.getItem('pak_tajarat_isRomanEnglish') === 'true';
  });

  // Worker Accounts State
  const [workerAccounts, setWorkerAccounts] = useState<WorkerAccount[]>(() => {
    try {
      const saved = localStorage.getItem('pak_tajarat_worker_accounts');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: 'WRK-1001',
        workerName: 'Ali Worker',
        workerEmail: 'worker@paktajarat.pk',
        workerPasskey: 'worker123',
        role: 'Worker',
        allowedModules: ['products', 'blogs'],
        status: 'active',
        createdAt: new Date().toISOString(),
        assignedBy: 'Master Admin'
      }
    ];
  });

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
  }, [seoConfig, brandingConfig]);

  // Branding & Logo Realtime sync from Firestore
  useEffect(() => {
    const unsubscribeBranding = onSnapshot(doc(db, 'config', 'branding'), (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data() as Partial<SiteBrandingConfig>;
        setBrandingConfig(prev => {
          const merged = { ...prev, ...cloudData };
          try {
            localStorage.setItem('pak_tajarat_branding_config', JSON.stringify(merged));
          } catch (_) {}
          
          setLogoConfig(lPrev => ({
            ...lPrev,
            logoImageUrl: merged.logoImageUrl !== undefined ? (merged.logoImageUrl || '') : lPrev.logoImageUrl,
            logoType: merged.logoType || (merged.logoImageUrl ? 'image' : 'vector'),
            customText: merged.customText || lPrev.customText,
            faviconUrl: merged.faviconUrl !== undefined ? (merged.faviconUrl || '') : lPrev.faviconUrl
          }));

          return merged;
        });
      }
    }, (err) => {
      console.warn("Branding real-time sync warning:", err);
    });

    return () => unsubscribeBranding();
  }, []);

  // Worker Accounts Realtime sync from Firestore
  useEffect(() => {
    const unsubscribeWorkers = onSnapshot(collection(db, 'worker_accounts'), (snapshot) => {
      const list: WorkerAccount[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as WorkerAccount);
      });
      if (list.length > 0) {
        setWorkerAccounts(list);
        try {
          localStorage.setItem('pak_tajarat_worker_accounts', JSON.stringify(list));
        } catch (_) {}
      }
    }, (err) => {
      console.warn("Worker accounts snapshot error:", err);
    });
    return () => unsubscribeWorkers();
  }, []);

  // Blogs Realtime sync from Firestore
  useEffect(() => {
    const unsubscribeBlogs = onSnapshot(collection(db, 'blogs'), (snapshot) => {
      const items: BlogPost[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as BlogPost);
      });

      const savedLocal = localStorage.getItem('pak_tajarat_blogs');
      let localBlogs: BlogPost[] = [];
      if (savedLocal) {
        try { localBlogs = JSON.parse(savedLocal); } catch (_) {}
      }

      if (items.length === 0) {
        if (localBlogs.length > 0) {
          setBlogs(localBlogs);
        } else {
          setBlogs(INITIAL_BLOGS);
          try {
            localStorage.setItem('pak_tajarat_blogs', JSON.stringify(INITIAL_BLOGS));
          } catch (_) {}
        }
      } else {
        const blogMap = new Map<string, BlogPost>();
        items.forEach(item => blogMap.set(item.id, item));

        // Preserve any recent local additions not yet in Firestore snapshot
        if (Array.isArray(localBlogs)) {
          localBlogs.forEach(lb => {
            if (!blogMap.has(lb.id)) {
              blogMap.set(lb.id, lb);
            }
          });
        }

        // Preserve INITIAL_BLOGS if not removed
        INITIAL_BLOGS.forEach(ib => {
          if (!blogMap.has(ib.id)) {
            blogMap.set(ib.id, ib);
          }
        });

        const mergedList = Array.from(blogMap.values());
        setBlogs(mergedList);
        try {
          localStorage.setItem('pak_tajarat_blogs', JSON.stringify(mergedList));
        } catch (_) {}
      }
    }, (err) => {
      console.warn("Blogs realtime sync error:", err);
      const savedLocal = localStorage.getItem('pak_tajarat_blogs');
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBlogs(parsed);
            return;
          }
        } catch (_) {}
      }
      setBlogs(INITIAL_BLOGS);
    });

    return () => unsubscribeBlogs();
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
      const path = window.location.pathname.replace(/\\/+$/, '') || '/';
      const match = path.match(/^\\/(?:products|product)\\/([^/]+)$/i);

      if (match) {
        let productId = match[1];
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
    setBrandingConfig(updated);

    // Keep logoConfig aligned
    setLogoConfig(prev => ({
      ...prev,
      logoImageUrl: updated.logoImageUrl !== undefined ? (updated.logoImageUrl || '') : prev.logoImageUrl,
      logoType: updated.logoType || (updated.logoImageUrl ? 'image' : 'vector'),
      customText: updated.customText || prev.customText,
      faviconUrl: updated.faviconUrl !== undefined ? (updated.faviconUrl || '') : prev.faviconUrl
    }));

    // 1. Immediately cache in localStorage for instant offline & zero-lag reload persistence
    try {
      localStorage.setItem('pak_tajarat_branding_config', JSON.stringify(updated));
    } catch (e) {
      console.warn("LocalStorage branding save warning:", e);
    }

    // 2. Force immediate DOM head update (tab favicon, apple touch icon, title)
    applySeoAndBrandingToHead(seoConfig, updated);

    // 3. Persist permanently to Cloud Firestore
    try {
      await setDoc(doc(db, 'config', 'branding'), updated, { merge: true });
    } catch (err) {
      console.error("Firestore branding save error:", err);
    }

    addNotification('Branding Updated 🎨', 'Branding & favicon permanently saved.', 'success');
  };

  const updateSiteCategories = async (categories: CategoryItem[]) => {
    setSiteCategories(categories);
    addNotification('Categories Updated 📁', 'Site category configuration updated.', 'success');
  };

  const addMediaItem = async (item: MediaItem) => {
    setMediaLibrary(prev => [item, ...prev]);
    addNotification('Media Added 🖼️', `Media file ${item.name} uploaded.`, 'success');
  };

  const updateMediaItem = async (item: MediaItem) => {
    setMediaLibrary(prev => prev.map(m => m.id === item.id ? item : m));
  };

  const deleteMediaItem = async (id: string) => {
    setMediaLibrary(prev => prev.filter(m => m.id !== id));
    addNotification('Media Deleted', 'Item removed from media library.', 'warning');
  };

  const updateSeoConfig = async (config: Partial<SeoConfig>) => {
    const updated = { ...seoConfig, ...config };
    setSeoConfig(updated);
    addNotification('SEO Config Updated 🚀', 'Global SEO parameters updated.', 'success');
  };

  const updatePromoBannerEnabled = async (enabled: boolean) => {
    setPromoBannerEnabled(enabled);
  };

  const updateHeroBanners = async (banners: HeroBanner[]) => {
    setHeroBanners(banners);
    addNotification('Banners Updated 🖼️', 'Hero banners updated successfully.', 'success');
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

  const updateAdminCredentials = async (email: string, pass: string) => {
    setAdminEmailState(email);
    setAdminPasswordState(pass);
    localStorage.setItem('pak_tajarat_adminEmail', email);
    // Store password only in sessionStorage (not localStorage) to avoid plaintext persistence
    sessionStorage.setItem('pak_tajarat_adminPassword', pass);
    addNotification('Admin Credentials Saved 🔑', 'Master Admin login credentials updated.', 'success');
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
    const publishedBlog: BlogPost = {
      ...blog,
      status: blog.status || 'Published',
      isPublished: blog.isPublished !== undefined ? blog.isPublished : true,
    };
    setBlogs(prev => {
      const updated = [publishedBlog, ...prev.filter(b => b.id !== publishedBlog.id)];
      try {
        localStorage.setItem('pak_tajarat_blogs', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    try {
      await setDoc(doc(db, 'blogs', publishedBlog.id), cleanUndefinedProps(publishedBlog));
    } catch (err) {
      console.warn("Firestore blog save warning:", err);
    }
    addNotification('Blog Published 📝', `Article "${publishedBlog.title}" published and saved permanently!`, 'success');
  };

  const updateBlog = async (blog: BlogPost) => {
    const updatedBlog: BlogPost = {
      ...blog,
      status: blog.status || 'Published',
      isPublished: blog.isPublished !== undefined ? blog.isPublished : true,
    };
    setBlogs(prev => {
      const updated = prev.map(b => b.id === updatedBlog.id ? updatedBlog : b);
      try {
        localStorage.setItem('pak_tajarat_blogs', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    try {
      await setDoc(doc(db, 'blogs', updatedBlog.id), cleanUndefinedProps(updatedBlog), { merge: true });
    } catch (err) {
      console.warn("Firestore blog update warning:", err);
    }
    addNotification('Blog Updated 📝', `Article "${updatedBlog.title}" updated and saved live!`, 'success');
  };

  const deleteBlog = async (id: string) => {
    setBlogs(prev => {
      const updated = prev.filter(b => b.id !== id);
      try {
        localStorage.setItem('pak_tajarat_blogs', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    try {
      await deleteDoc(doc(db, 'blogs', id));
    } catch (err) {
      console.warn("Firestore blog delete error:", err);
    }
    addNotification('Blog Deleted', 'Article deleted from database.', 'warning');
  };

  const addWorkerAccount = async (workerData: Omit<WorkerAccount, 'createdAt' | 'role'>) => {
    const newWorker: WorkerAccount = {
      ...workerData,
      role: 'Worker',
      createdAt: new Date().toISOString()
    };
    setWorkerAccounts(prev => {
      const updated = [...prev.filter(w => w.id !== newWorker.id), newWorker];
      try {
        localStorage.setItem('pak_tajarat_worker_accounts', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    try {
      await setDoc(doc(db, 'worker_accounts', newWorker.id), newWorker);
    } catch (err) {
      console.error("Firestore worker account creation error:", err);
    }
    addNotification('Worker Account Created 🔑', `Worker ${newWorker.workerName} (${newWorker.id}) registered successfully!`, 'success');
  };

  const updateWorkerAccountStatus = async (workerId: string, status: 'active' | 'suspended') => {
    setWorkerAccounts(prev => {
      const updated = prev.map(w => w.id === workerId ? { ...w, status } : w);
      try {
        localStorage.setItem('pak_tajarat_worker_accounts', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    try {
      await updateDoc(doc(db, 'worker_accounts', workerId), { status });
    } catch (err) {
      console.error("Firestore worker account status update error:", err);
    }
    addNotification('Worker Status Updated', `Worker status set to ${status.toUpperCase()}`, 'info');
  };

  const deleteWorkerAccount = async (workerId: string) => {
    setWorkerAccounts(prev => {
      const updated = prev.filter(w => w.id !== workerId);
      try {
        localStorage.setItem('pak_tajarat_worker_accounts', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    try {
      await deleteDoc(doc(db, 'worker_accounts', workerId));
    } catch (err) {
      console.error("Firestore worker account delete error:", err);
    }
    addNotification('Worker Account Removed', `Worker account deleted successfully.`, 'warning');
  };

  const updateWorkerAccountPassword = async (workerId: string, newPasskey: string) => {
    setWorkerAccounts(prev => {
      const updated = prev.map(w => w.id === workerId ? { ...w, workerPasskey: newPasskey } : w);
      try {
        localStorage.setItem('pak_tajarat_worker_accounts', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    try {
      await updateDoc(doc(db, 'worker_accounts', workerId), { workerPasskey: newPasskey });
    } catch (err) {
      console.error("Firestore worker passkey update error:", err);
    }
    addNotification('Worker Password Updated 🔑', `New passkey set for worker ${workerId}`, 'success');
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
      adminEmail, adminPassword, updateAdminCredentials,
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
