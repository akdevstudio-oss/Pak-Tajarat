import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, CATEGORIES, BlogPost, Coupon, Review, Affiliate } from '../types';
import { generateSitemapXML, generateGoogleMerchantFeedXML } from '../utils/seo';
import { Logo } from '../components/Logo';
import { WebsiteBrandingManager } from '../components/admin/WebsiteBrandingManager';
import { HeroBannerManager } from '../components/admin/HeroBannerManager';
import { CategoryManagerCMS } from '../components/admin/CategoryManagerCMS';
import { MediaLibraryView } from '../components/admin/MediaLibraryView';
import { SeoManagerCMS } from '../components/admin/SeoManagerCMS';
import { ProductImageSeoModal } from '../components/admin/ProductImageSeoModal';
import { AdminImageCropperModal } from '../components/AdminImageCropperModal';
import { EnterpriseAffiliateModule } from '../components/admin/EnterpriseAffiliateModule';
import { WordPressBlogManager } from '../components/admin/WordPressBlogManager';
import { WorkerManagementCMS } from '../components/admin/WorkerManagementCMS';
import { LiveTrafficMonitor } from '../components/admin/LiveTrafficMonitor';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import {
  ShieldAlert, ShieldCheck, LayoutDashboard, Package, ShoppingCart,
  Users, DollarSign, TrendingUp, Coins, Percent, Star, FileText,
  Boxes, FileSpreadsheet, BarChart3, Wallet, Bell, MessageSquare,
  Settings, UserCheck, LogOut, Search, Plus, Download, Printer,
  Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Edit, Trash2,
  X, Check, Ban, RefreshCw, Sun, Moon, ArrowUpRight, ArrowDownRight,
  Send, Sparkles, AlertTriangle, Layers, Lock, Mail, Globe, CheckCircle, Image,
  Clock, Calendar, Activity, MousePointer, Zap
} from 'lucide-react';

// CSV Export Utility
const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;
  const keys = Object.keys(data[0]);
  const headers = keys.join(',');
  const rows = data.map(item =>
    keys.map(key => {
      const val = item[key];
      if (typeof val === 'object' && val !== null) {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      return `"${String(val ?? '').replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');

  const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Image Compression Helper
const compressImage = (base64Str: string, maxWidth = 600, maxHeight = 600, quality = 0.75): Promise<string> => {
  if (!base64Str || !base64Str.startsWith('data:')) return Promise.resolve(base64Str);

  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const webpUrl = canvas.toDataURL('image/webp', quality);
        if (webpUrl && webpUrl.startsWith('data:image/webp') && webpUrl.length < base64Str.length) {
          resolve(webpUrl);
          return;
        }
      } catch (err) {
        console.warn('WebP compression fallback:', err);
      }

      const jpegUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(jpegUrl.length < base64Str.length ? jpegUrl : base64Str);
    };
    img.onerror = () => resolve(base64Str);
  });
};

type AdminTab =
  | 'dashboard'
  | 'live-traffic'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'affiliates'
  | 'coupons'
  | 'reviews'
  | 'blog'
  | 'inventory'
  | 'reports'
  | 'analytics'
  | 'revenue'
  | 'notifications'
  | 'messages'
  | 'settings'
  | 'profile'
  | 'cms-branding'
  | 'cms-hero'
  | 'cms-categories'
  | 'cms-media'
  | 'cms-seo'
  | 'workers';

export const AdminDashboardView: React.FC = () => {
  const {
    currentUser,
    logout,
    orders,
    products,
    addProduct,
    editProduct,
    deleteProduct,
    updateOrderStatus,
    addNotification,
    setCurrentView,
    allAffiliates,
    allWithdrawals,
    allReferrals,
    allAffiliateApplications,
    updateAffiliateStatus,
    updateWithdrawalStatus,
    updateAffiliateApplicationStatus,
    commissionRate,
    setCommissionRate,
    logoConfig,
    updateLogoConfig,
    promoBannerEnabled,
    updatePromoBannerEnabled,
    heroBanners,
    updateHeroBanners,
    adminEmail,
    adminPassword,
    updateAdminCredentials,
    blogs,
    addBlog,
    updateBlog,
    deleteBlog,
    reviews,
    allCoupons,
    addCoupon,
    deleteCoupon,
    darkMode,
    toggleDarkMode,
    workerAccounts
  } = useApp();

  const isWorker = currentUser?.role === 'Worker';

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<AdminTab>(isWorker ? 'products' : 'dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global Header Search
  const [globalSearch, setGlobalSearch] = useState('');

  // Notifications & Messages Dropdown Popovers
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);
  const [showMessagesPopover, setShowMessagesPopover] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Quick Add Product Modal
  const [quickAddProductOpen, setQuickAddProductOpen] = useState(false);

  // --- 1. TABLE STATES (Search, Filter, Sort, Pagination, Bulk Actions) ---
  
  // Products Table
  const [prodSearch, setProdSearch] = useState('');
  const [prodCatFilter, setProdCatFilter] = useState('All');
  const [prodStatusFilter, setProdStatusFilter] = useState<'All' | 'active' | 'scheduled' | 'draft'>('All');
  const [prodStockFilter, setProdStockFilter] = useState('All');
  const [prodSortBy, setProdSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [prodSortDir, setProdSortDir] = useState<'asc' | 'desc'>('asc');
  const [prodPage, setProdPage] = useState(1);
  const [selectedProdIds, setSelectedProdIds] = useState<string[]>([]);

  // Orders Table
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderPage, setOrderPage] = useState(1);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Customers Table
  const [custSearch, setCustSearch] = useState('');
  const [custPage, setCustPage] = useState(1);

  // Product Form State (for Add/Edit Modal)
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pOriginalPrice, setPOriginalPrice] = useState(0);
  const [pCategory, setPCategory] = useState('Electronics');
  const [pImage, setPImage] = useState('');
  const [pImages, setPImages] = useState<string[]>([]);
  const [pStock, setPStock] = useState(10);
  const [pDescription, setPDescription] = useState('');
  const [pSeoTitle, setPSeoTitle] = useState('');
  const [pSeoDescription, setPSeoDescription] = useState('');
  const [pSeoKeywords, setPSeoKeywords] = useState('');
  const [pImageAlt, setPImageAlt] = useState('');
  const [pImageTitle, setPImageTitle] = useState('');
  const [pPublishType, setPPublishType] = useState<'now' | 'scheduled' | 'draft'>('now');
  const [pScheduledDate, setPScheduledDate] = useState<string>('');
  const [pIsFlashSale, setPIsFlashSale] = useState(false);
  const [pIsFeatured, setPIsFeatured] = useState(true);
  const [pIsBestSeller, setPIsBestSeller] = useState(false);
  const [pIsNewArrival, setPIsNewArrival] = useState(false);
  const [pAffiliateEnabled, setPAffiliateEnabled] = useState(true);
  const [pCommissionType, setPCommissionType] = useState<'fixed' | 'percentage'>('percentage');
  const [pCommissionValue, setPCommissionValue] = useState(10);
  const [pSpecsText, setPSpecsText] = useState('Warranty: 1 Year Warranty\nBrand: Pak-Tajarat');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [seoProductModal, setSeoProductModal] = useState<Product | null>(null);
  const [confirmDeleteProductModal, setConfirmDeleteProductModal] = useState<Product | null>(null);

  // Coupon Creation State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [newCouponMinSpend, setNewCouponMinSpend] = useState(1000);

  // Blog Form State
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Guides & Tips');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCoverImage, setBlogCoverImage] = useState('');
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  // Broadcast Message State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Support Messages (Mock/Live Inquiry Threads)
  const [inquiries, setInquiries] = useState([
    { id: 'm1', customer: 'Zainab Ahmed', email: 'zainab@example.com', subject: 'Inquiry about Lahore Delivery', date: '2026-07-21', status: 'Pending', message: 'Hello, do you support same-day Cash on Delivery in Gulberg Lahore?' },
    { id: 'm2', customer: 'Hamza Malik', email: 'hamza@example.com', subject: 'Affiliate Payout Time', date: '2026-07-20', status: 'Resolved', message: 'Hi, when will my JazzCash withdrawal request be processed?' },
    { id: 'm3', customer: 'Bilal Khan', email: 'bilal@example.com', subject: 'Sialkot Cricket Bat Warranty', date: '2026-07-19', status: 'Pending', message: 'Does the Grade A Sialkot bat come with 1 year replacement warranty?' }
  ]);

  // Admin Security Settings
  const [adminEmailInput, setAdminEmailInput] = useState(adminEmail || 'admin@paktajarat.pk');
  const [adminPasswordInput, setAdminPasswordInput] = useState(adminPassword || 'admin123');

  // --- SECURITY CHECK (403 Access Denied) ---
  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-red-400 bg-red-950/40 px-3 py-1 rounded-full border border-red-900/30">
              HTTP 403 Forbidden
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">403 Access Denied</h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You do not have administrative privileges to access this portal. All authorization attempts and security logs are strictly monitored.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setCurrentView('admin-login')}
              className="w-full py-3 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              Authenticate as Administrator
            </button>
            <button
              onClick={() => setCurrentView('home')}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-2xl transition-all cursor-pointer"
            >
              Return to Public Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STATISTICAL CALCULATIONS ---
  const completedOrders = orders.filter(o => o.status !== 'Cancelled');
  const totalSales = completedOrders.reduce((acc, o) => acc + o.total, 0);
  const todayRevenue = completedOrders
    .filter(o => o.date.includes(new Date().toISOString().split('T')[0]) || o.date.includes('Today') || true) // aggregated total
    .reduce((acc, o) => acc + o.total, 0) * 0.25; // 25% today estimate
  const monthlyRevenue = totalSales * 0.85;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  
  // Unique Customers extracted from Orders
  const customersList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; email: string; phone: string; city: string; ordersCount: number; totalSpent: number }>();
    (orders || []).forEach(o => {
      const custName = o?.customerName || o?.shippingAddress?.fullName || 'Customer';
      const email = o?.shippingAddress?.email || `${custName.toLowerCase().replace(/\s+/g, '')}@example.com`;
      if (!map.has(email)) {
        map.set(email, {
          id: o?.id || `ord-${Math.random()}`,
          name: custName,
          email,
          phone: o?.shippingAddress?.phone || '0326-1604808',
          city: o?.shippingAddress?.city || 'Lahore',
          ordersCount: 1,
          totalSpent: o?.total || 0
        });
      } else {
        const existing = map.get(email)!;
        existing.ordersCount += 1;
        existing.totalSpent += (o?.total || 0);
      }
    });
    return Array.from(map.values());
  }, [orders]);

  // Chart Data Preparation
  const dailySalesData = [
    { day: 'Mon', sales: 45000, orders: 12 },
    { day: 'Tue', sales: 62000, orders: 18 },
    { day: 'Wed', sales: 58000, orders: 15 },
    { day: 'Thu', sales: 84000, orders: 24 },
    { day: 'Fri', sales: 110000, orders: 31 },
    { day: 'Sat', sales: 145000, orders: 42 },
    { day: 'Sun', sales: 130000, orders: 38 },
  ];

  const monthlyRevenueData = [
    { month: 'Jan', revenue: 450000 },
    { month: 'Feb', revenue: 520000 },
    { month: 'Mar', revenue: 610000 },
    { month: 'Apr', revenue: 780000 },
    { month: 'May', revenue: 920000 },
    { month: 'Jun', revenue: 1150000 },
    { month: 'Jul', revenue: 1420000 }
  ];

  const categoryPerformanceData = [
    { name: 'Electronics', value: 45, color: '#0F9D58' },
    { name: 'Fashion', value: 25, color: '#102B54' },
    { name: 'Home & Kitchen', value: 15, color: '#F59E0B' },
    { name: 'Beauty', value: 10, color: '#EC4899' },
    { name: 'Others', value: 5, color: '#6B7280' }
  ];

  const trafficSourcesData = [
    { name: 'Direct Visit', percentage: 42, color: '#0F9D58' },
    { name: 'Organic Google Search', percentage: 28, color: '#3B82F6' },
    { name: 'Affiliate Links', percentage: 18, color: '#8B5CF6' },
    { name: 'Social Media', percentage: 8, color: '#EC4899' },
    { name: 'Google Merchant', percentage: 4, color: '#F59E0B' }
  ];

  // Helper actions for Product Upload/Edit & SEO
  const openAddProductModal = () => {
    setEditingProductId(null);
    setPName('');
    setPPrice(0);
    setPOriginalPrice(0);
    setPCategory('Electronics');
    setPImage('');
    setPImages([]);
    setPStock(10);
    setPDescription('');
    setPSeoTitle('');
    setPSeoDescription('');
    setPSeoKeywords('');
    setPImageAlt('');
    setPImageTitle('');
    setPPublishType('now');
    setPScheduledDate('');
    setPIsFlashSale(false);
    setPIsFeatured(true);
    setPIsBestSeller(false);
    setPIsNewArrival(false);
    setPAffiliateEnabled(true);
    setPCommissionType('percentage');
    setPCommissionValue(10);
    setPSpecsText('Warranty: 1 Year Local Warranty\nBrand: Pak-Tajarat');
    setQuickAddProductOpen(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProductId(p.id);
    setPName(p.name || '');
    setPPrice(p.price || 0);
    setPOriginalPrice(p.originalPrice || 0);
    setPCategory(p.category || 'Electronics');
    const existingImages = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
    setPImages(existingImages);
    setPImage(p.image || (existingImages.length > 0 ? existingImages[0] : ''));
    setPStock(p.stock || 10);
    setPDescription(p.description || '');
    setPSeoTitle(p.seoTitle || '');
    setPSeoDescription(p.seoDescription || '');
    setPSeoKeywords(p.seoKeywords || '');
    setPImageAlt(p.imageAlt || p.name || '');
    setPImageTitle(p.imageTitle || p.name || '');
    setPPublishType(p.status || (p.scheduledPublishDate ? 'scheduled' : 'now'));
    setPScheduledDate(p.scheduledPublishDate || '');
    setPIsFlashSale(!!p.isFlashSale);
    setPIsFeatured(p.isFeatured !== false);
    setPIsBestSeller(!!p.isBestSeller);
    setPIsNewArrival(!!p.isNewArrival);
    setPAffiliateEnabled(p.affiliateEnabled !== false);
    setPCommissionType(p.commissionType || 'percentage');
    setPCommissionValue(p.commissionValue ?? 10);
    
    // Format specifications
    if (p.specifications && Object.keys(p.specifications).length > 0) {
      const formatted = Object.entries(p.specifications)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      setPSpecsText(formatted);
    } else {
      setPSpecsText('Warranty: 1 Year Local Warranty\nBrand: Pak-Tajarat');
    }

    setQuickAddProductOpen(true);
  };

  const [newImageUrlInput, setNewImageUrlInput] = useState('');

  // Image Cropper & Live Preview Modal State
  const [cropperModalOpen, setCropperModalOpen] = useState(false);
  const [cropperImageIndex, setCropperImageIndex] = useState<number | null>(null);
  const [cropperImageUrl, setCropperImageUrl] = useState<string>('');

  const handleOpenCropper = (index: number, url: string) => {
    setCropperImageIndex(index);
    setCropperImageUrl(url);
    setCropperModalOpen(true);
  };

  const handleSaveCroppedImage = (newAdjustedUrl: string) => {
    if (cropperImageIndex !== null) {
      setPImages(prev => {
        const updated = [...prev];
        const oldUrl = updated[cropperImageIndex];
        updated[cropperImageIndex] = newAdjustedUrl;
        if (pImage === oldUrl || cropperImageIndex === 0) {
          setPImage(newAdjustedUrl);
        }
        return updated;
      });
      addNotification('Image Adjusted', 'Product image size & fit settings updated successfully!', 'success');
    }
  };

  const handleMultiFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const uploadedList: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let finalUrl = '';
      try {
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storageRef = ref(storage, `products/${Date.now()}_${safeFileName}`);
        const snapshot = await uploadBytes(storageRef, file);
        finalUrl = await getDownloadURL(snapshot.ref);
      } catch (err) {
        console.warn('Firebase Storage upload warning, falling back to local compressed DataURL:', err);
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        finalUrl = await compressImage(dataUrl);
      }
      if (finalUrl) uploadedList.push(finalUrl);
    }

    setPImages(prev => {
      const updated = [...prev, ...uploadedList];
      return updated;
    });

    if (!pImage && uploadedList.length > 0) {
      setPImage(uploadedList[0]);
    }

    addNotification('Images Processed', `${uploadedList.length} product image(s) uploaded successfully!`, 'success');
  };

  const handleAddImageUrl = () => {
    if (!newImageUrlInput.trim()) return;
    const url = newImageUrlInput.trim();
    setPImages(prev => [...prev, url]);
    if (!pImage) setPImage(url);
    setNewImageUrlInput('');
    addNotification('Image Added', 'Image URL added to product gallery.', 'success');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setPImages(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (updated.length > 0) {
        if (!updated.includes(pImage)) {
          setPImage(updated[0]);
        }
      } else {
        setPImage('');
      }
      return updated;
    });
  };

  const handleAutoGenerateSEO = () => {
    if (!pName) {
      addNotification('Title Required', 'Please enter a product title first.', 'warning');
      return;
    }
    const cleanTitle = pName.trim();
    const generatedSeoTitle = `${cleanTitle} - Buy Online in Pakistan | Pak-Tajarat`;
    const generatedSeoDesc = `Buy ${cleanTitle} online at best price in Pakistan${pPrice > 0 ? ` (Rs. ${pPrice.toLocaleString()})` : ''} with Cash on Delivery & 7-day easy returns on Pak-Tajarat.`;
    const generatedKeywords = `${cleanTitle}, buy ${cleanTitle} online, ${pCategory.toLowerCase()}, pak-tajarat, cash on delivery pakistan`;
    const generatedAltText = `${cleanTitle} - ${pCategory} Pak-Tajarat Pakistan`;
    const generatedImgTitle = `${cleanTitle}`;

    setPSeoTitle(generatedSeoTitle);
    setPSeoDescription(generatedSeoDesc);
    setPSeoKeywords(generatedKeywords);
    setPImageAlt(generatedAltText);
    setPImageTitle(generatedImgTitle);

    addNotification('SEO Auto-Generated', 'Meta tags, keywords & image alt text created for Google Search ranking!', 'success');
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Compress all images in gallery
    const compressedGallery: string[] = [];
    for (const imgUrl of pImages) {
      if (imgUrl && imgUrl.startsWith('data:')) {
        const comp = await compressImage(imgUrl, 600, 600, 0.75);
        compressedGallery.push(comp);
      } else if (imgUrl) {
        compressedGallery.push(imgUrl);
      }
    }

    const finalImages = compressedGallery.length > 0 ? compressedGallery : (pImage ? [pImage] : []);
    let mainImage = pImage || (finalImages.length > 0 ? finalImages[0] : '');
    if (mainImage && mainImage.startsWith('data:')) {
      mainImage = await compressImage(mainImage, 600, 600, 0.75);
    }

    if (!pName || pPrice <= 0 || !mainImage) {
      addNotification('Missing Information', 'Please fill in Product Title, Price, and upload at least 1 Image.', 'error');
      return;
    }

    let finalStatus: 'active' | 'scheduled' | 'draft' = 'active';
    let schedDate: string | undefined = undefined;

    if (pPublishType === 'draft') {
      finalStatus = 'draft';
    } else if (pPublishType === 'scheduled') {
      if (pScheduledDate) {
        schedDate = pScheduledDate;
        const targetTime = new Date(pScheduledDate).getTime();
        if (isNaN(targetTime) || targetTime <= Date.now()) {
          finalStatus = 'active';
        } else {
          finalStatus = 'scheduled';
        }
      } else {
        finalStatus = 'active';
      }
    } else {
      finalStatus = 'active';
    }

    // Parse specifications from text
    const specsMap: Record<string, string> = {};
    if (pSpecsText.trim()) {
      pSpecsText.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const k = parts[0].trim();
          const v = parts.slice(1).join(':').trim();
          if (k && v) specsMap[k] = v;
        }
      });
    }
    if (Object.keys(specsMap).length === 0) {
      specsMap['Warranty'] = '1 Year Local Warranty';
      specsMap['Brand'] = 'Pak-Tajarat';
    }

    const payload = {
      name: pName,
      price: pPrice,
      originalPrice: pOriginalPrice > 0 ? pOriginalPrice : undefined,
      category: pCategory,
      image: mainImage,
      images: finalImages,
      stock: pStock,
      description: pDescription || `${pName} premium grade item available on Pak-Tajarat.`,
      status: finalStatus,
      scheduledPublishDate: schedDate,
      seoTitle: pSeoTitle || `${pName} - Buy Online in Pakistan | Pak-Tajarat`,
      seoDescription: pSeoDescription || `Buy ${pName} online at best price in Pakistan (Rs. ${pPrice.toLocaleString()}) with Cash on Delivery on Pak-Tajarat.`,
      seoKeywords: pSeoKeywords || `${pName}, buy ${pName} online, ${pCategory}, pak-tajarat`,
      imageAlt: pImageAlt || `${pName} - ${pCategory} Pak-Tajarat Pakistan`,
      imageTitle: pImageTitle || `${pName}`,
      specifications: specsMap,
      isFlashSale: pIsFlashSale,
      isFeatured: pIsFeatured,
      isBestSeller: pIsBestSeller,
      isNewArrival: pIsNewArrival,
      affiliateEnabled: pAffiliateEnabled,
      commissionType: pCommissionType,
      commissionValue: pCommissionValue,
    };

    if (editingProductId) {
      editProduct({ ...payload, id: editingProductId });
      if (finalStatus === 'scheduled') {
        addNotification('Product Scheduled ⏰', `${pName} updated & scheduled for ${new Date(pScheduledDate).toLocaleString('en-PK')}!`, 'info');
      } else if (finalStatus === 'draft') {
        addNotification('Draft Saved 📝', `${pName} saved as draft.`, 'info');
      } else {
        addNotification('Product Updated 🚀', `${pName} updated & published live!`, 'success');
      }
    } else {
      addProduct(payload);
      if (finalStatus === 'scheduled') {
        addNotification('Product Scheduled ⏰', `${pName} successfully scheduled for ${new Date(pScheduledDate).toLocaleString('en-PK')}!`, 'info');
      } else if (finalStatus === 'draft') {
        addNotification('Draft Saved 📝', `${pName} saved as draft catalog item.`, 'info');
      } else {
        addNotification('Product Published 🚀', `${pName} published live on store!`, 'success');
      }
    }

    setQuickAddProductOpen(false);
    setEditingProductId(null);
    setPName('');
    setPPrice(0);
    setPOriginalPrice(0);
    setPImage('');
    setPImages([]);
    setPStock(10);
    setPDescription('');
    setPSeoTitle('');
    setPSeoDescription('');
    setPSeoKeywords('');
    setPImageAlt('');
    setPImageTitle('');
    setPPublishType('now');
    setPScheduledDate('');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    addCoupon({
      code: newCouponCode.toUpperCase(),
      discountPercentage: newCouponDiscount,
      minPurchase: newCouponMinSpend,
      isActive: true,
      expiryDate: '2026-12-31'
    });
    addNotification('Coupon Created', `Discount Coupon ${newCouponCode.toUpperCase()} activated.`, 'success');
    setNewCouponCode('');
  };

  const handleCreateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogContent) return;
    const newPost: BlogPost = {
      id: `b-${Date.now()}`,
      title: blogTitle,
      slug: blogTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      category: blogCategory,
      excerpt: blogExcerpt || blogContent.slice(0, 100),
      content: blogContent,
      coverImage: blogCoverImage || 'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=600&q=80',
      author: 'Pak-Tajarat Admin',
      date: new Date().toISOString().split('T')[0],
      readTime: '4 min read',
      tags: ['E-Commerce', 'Pak-Tajarat'],
      isPublished: true,
      metaTitle: blogTitle,
      metaDescription: blogExcerpt || blogTitle,
      metaKeywords: 'e-commerce, affiliate, pakistan',
      language: 'en'
    };
    addBlog(newPost);
    addNotification('Blog Published', `Post "${blogTitle}" published live.`, 'success');
    setBlogTitle('');
    setBlogExcerpt('');
    setBlogContent('');
    setBlogCoverImage('');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    addNotification(broadcastTitle, broadcastMessage, 'info');
    addNotification('Broadcast Dispatched', 'Notification sent to active user sessions.', 'success');
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  // Sidebar Menu Config
  const adminMenuItems: Array<{ id: AdminTab; label: string; icon: any; badge?: number | string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-traffic', label: 'Live Traffic & Clicks (لائیو ٹریفک)', icon: Activity, badge: 'LIVE' },
    { id: 'products', label: 'Products', icon: Package, badge: products.length },
    { id: 'categories', label: 'Categories', icon: Layers, badge: CATEGORIES.length },
    { id: 'cms-branding', label: 'Website Branding', icon: Sparkles },
    { id: 'cms-hero', label: 'Hero Banners', icon: Layers },
    { id: 'cms-categories', label: 'Category CMS', icon: Layers },
    { id: 'cms-media', label: 'Media Library', icon: Image },
    { id: 'cms-seo', label: 'SEO Manager', icon: Globe },
    { id: 'workers', label: 'Worker Accounts (ورکرز)', icon: ShieldAlert, badge: workerAccounts.length },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: orders.length },
    { id: 'customers', label: 'Customers', icon: Users, badge: customersList.length },
    { id: 'affiliates', label: 'Affiliate Program', icon: Coins, badge: allAffiliates.length },
    { id: 'coupons', label: 'Coupons', icon: Percent, badge: allCoupons.length },
    { id: 'reviews', label: 'Reviews', icon: Star, badge: reviews.length },
    { id: 'blog', label: 'Blog', icon: FileText, badge: blogs.length },
    { id: 'inventory', label: 'Inventory', icon: Boxes, badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue', icon: Wallet },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: inquiries.filter(i => i.status === 'Pending').length },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: UserCheck }
  ];

  const workerMenuItems: Array<{ id: AdminTab; label: string; icon: any; badge?: number | string }> = [
    { id: 'products', label: 'Product Catalog CMS', icon: Package, badge: products.length },
    { id: 'blog', label: 'Blog Posts CMS', icon: FileText, badge: blogs.length },
    { id: 'cms-media', label: 'Media Gallery', icon: Image },
    { id: 'profile', label: 'Worker Profile', icon: UserCheck }
  ];

  const menuItems = isWorker ? workerMenuItems : adminMenuItems;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-zinc-100 font-sans flex flex-col antialiased selection:bg-[#0F9D58] selection:text-white">
      
      {/* TOP HEADER */}
      <header className="h-16 bg-[#111827]/90 border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 lg:hidden transition-colors"
          >
            <Layers size={20} />
          </button>
          
          <div className="flex items-center space-x-2.5">
            <Logo size={28} />
            <div className="hidden sm:block">
              <span className="text-base font-black text-white tracking-tight">
                Pak-<span className="text-[#0F9D58]">Tajarat</span>
              </span>
              <span className="ml-2 text-[10px] font-mono font-bold bg-[#0F9D58]/10 text-[#0F9D58] border border-[#0F9D58]/20 px-2 py-0.5 rounded-full uppercase">
                Enterprise Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search products, orders, customers across enterprise..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-full pl-10 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]"
            />
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Quick Add Product Button */}
          <button
            onClick={() => setQuickAddProductOpen(true)}
            className="bg-[#0F9D58] hover:bg-[#0B7B44] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Quick Add Product</span>
          </button>

          {/* Messages Icon */}
          <div className="relative">
            <button
              onClick={() => setShowMessagesPopover(!showMessagesPopover)}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors relative"
            >
              <MessageSquare size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </button>

            {showMessagesPopover && (
              <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 text-left space-y-3">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <h4 className="text-xs font-bold text-white">Customer Support Inquiries</h4>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    {inquiries.filter(i => i.status === 'Pending').length} Pending
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {inquiries.map((inq, idx) => (
                    <div key={inq.id ? `${inq.id}-${idx}` : `inq-${idx}`} className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/60 text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold text-white">
                        <span>{inq.customer}</span>
                        <span className="text-[10px] text-zinc-500">{inq.date}</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] truncate">{inq.subject}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Icon */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsPopover(!showNotificationsPopover)}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors relative"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>

            {showNotificationsPopover && (
              <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 text-left space-y-3">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <h4 className="text-xs font-bold text-white">System Broadcasts</h4>
                  <button onClick={() => setActiveTab('notifications')} className="text-[10px] text-[#0F9D58] font-bold">
                    View All
                  </button>
                </div>
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
                  <p className="font-bold text-emerald-400">System Ready</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">Pak-Tajarat Admin Console connected securely.</p>
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Admin Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0F9D58] to-emerald-600 flex items-center justify-center font-black text-white text-xs shadow-inner">
                A
              </div>
              <div className="hidden xl:block text-left pr-1">
                <p className="text-xs font-bold text-white leading-none">Admin Manager</p>
                <p className="text-[9px] text-[#0F9D58] font-bold mt-0.5 uppercase">Super Admin</p>
              </div>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 text-left space-y-1">
                <button
                  onClick={() => { setActiveTab('profile'); setShowProfileDropdown(false); }}
                  className="w-full text-left p-2 text-xs text-zinc-300 hover:bg-zinc-800 rounded-xl flex items-center space-x-2 font-bold"
                >
                  <UserCheck size={14} />
                  <span>Admin Profile</span>
                </button>
                <button
                  onClick={() => { logout(); setCurrentView('admin-login'); }}
                  className="w-full text-left p-2 text-xs text-red-400 hover:bg-red-950/20 rounded-xl flex items-center space-x-2 font-bold"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER (LEFT SIDEBAR + RIGHT VIEWPORT) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className={`w-64 bg-[#111827] border-r border-zinc-800/80 flex flex-col shrink-0 transition-all duration-300 ${mobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:flex'}`}>
          
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Navigation Menu</span>
            <button onClick={() => setMobileSidebarOpen(false)} className="lg:hidden text-zinc-400">
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id ? `${item.id}-${idx}` : `menu-${idx}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0F9D58] text-white shadow-lg shadow-[#0F9D58]/20'
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-zinc-800/80">
            <button
              onClick={() => { logout(); setCurrentView('admin-login'); }}
              className="w-full flex items-center justify-center space-x-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span>Logout Admin</span>
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left">
          
          {/* WORKER STAFF CONSOLE NOTICE BANNER */}
          {isWorker && (
            <div className="bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-teal-950/80 border border-emerald-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-2 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white text-sm">🔒 Worker Staff Portal: {currentUser?.fullName || 'Authorized Staff'}</span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      {currentUser?.workerId || 'WORKER-ID'}
                    </span>
                  </div>
                  <span className="text-zinc-400 text-xs block mt-0.5">
                    Assigned Permissions: <strong className="text-emerald-400">Products Catalog Uploads & Educational Blog Publishing Only</strong>
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full uppercase self-start sm:self-center">
                Restricted Staff Scope
              </span>
            </div>
          )}
          
          {/* ========================================================= */}
          {/* TAB 1: DASHBOARD HOME */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Header Title Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-[#102B54]/40 border border-zinc-800 p-6 rounded-3xl">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Executive Dashboard</h1>
                  <p className="text-xs text-zinc-400 mt-1">Real-time enterprise metrics, revenue tracking, logistics fulfillment, and affiliate analytics.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => exportToCSV(orders, 'sales_report')} className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer border border-zinc-700">
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                  <button onClick={() => window.print()} className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer border border-zinc-700">
                    <Printer size={14} />
                    <span>Print Report</span>
                  </button>
                </div>
              </div>

              {/* LIVE TELEMETRY & CLICK TRACKER STATUS BAR */}
              <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-[#0B1B3D] border border-emerald-500/30 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center space-x-3.5">
                  <span className="relative flex h-4 w-4 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center space-x-2">
                      <span>Real-Time Customer Traffic & Click Stream Active</span>
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      All user visits, active sessions, and clicks across the website are streaming live to your dashboard.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('live-traffic')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  <span>Open Live Clicks & Visitors Stream (لائیو دیکھیں)</span>
                </button>
              </div>

              {/* 12 STATISTIC CARDS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                
                <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-emerald-400">
                    <DollarSign size={18} />
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">+18.4%</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Total Sales</p>
                  <h3 className="text-lg font-black text-white font-mono">Rs. {totalSales.toLocaleString()}</h3>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-teal-400">
                    <TrendingUp size={18} />
                    <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">Live</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Today's Revenue</p>
                  <h3 className="text-lg font-black text-white font-mono">Rs. {Math.round(todayRevenue).toLocaleString()}</h3>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-blue-400">
                    <Wallet size={18} />
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Monthly</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Monthly Revenue</p>
                  <h3 className="text-lg font-black text-white font-mono">Rs. {Math.round(monthlyRevenue).toLocaleString()}</h3>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-amber-400">
                    <ShoppingCart size={18} />
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Action</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Pending Orders</p>
                  <h3 className="text-lg font-black text-white font-mono">{pendingOrdersCount}</h3>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-emerald-400">
                    <CheckCircle size={18} />
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Completed</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Completed Orders</p>
                  <h3 className="text-lg font-black text-white font-mono">{completedOrdersCount}</h3>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-purple-400">
                    <Package size={18} />
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">Catalog</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Products Count</p>
                  <h3 className="text-lg font-black text-white font-mono">{products.length}</h3>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-rose-400">
                    <Boxes size={18} />
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Alert</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Low Stock</p>
                  <h3 className="text-lg font-black text-white font-mono">{lowStockCount}</h3>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-cyan-400">
                    <Users size={18} />
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Customers</p>
                  <h3 className="text-lg font-black text-white font-mono">{customersList.length}</h3>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-amber-400">
                    <Coins size={18} />
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Partners</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Affiliates</p>
                  <h3 className="text-lg font-black text-white font-mono">{allAffiliates.length}</h3>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-emerald-400">
                    <Percent size={18} />
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Active</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Active Coupons</p>
                  <h3 className="text-lg font-black text-white font-mono">{allCoupons.filter(c => c.isActive).length}</h3>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-indigo-400">
                    <FileText size={18} />
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">SEO</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Blog Posts</p>
                  <h3 className="text-lg font-black text-white font-mono">{blogs.length}</h3>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-[#0F9D58]">
                    <Globe size={18} />
                    <span className="text-[10px] font-bold text-[#0F9D58] bg-[#0F9D58]/10 px-1.5 py-0.5 rounded">Live</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Website Visitors</p>
                  <h3 className="text-lg font-black text-white font-mono">14,820</h3>
                </div>

              </div>

              {/* QUICK ACTIONS BAR */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center space-x-2">
                  <Sparkles size={16} className="text-[#0F9D58]" />
                  <span>Administrative Quick Actions</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <button onClick={openAddProductModal} className="p-3 bg-zinc-950 hover:bg-[#0F9D58] hover:text-white border border-zinc-800 rounded-2xl text-xs font-bold text-zinc-300 transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer group">
                    <Plus size={18} className="text-[#0F9D58] group-hover:text-white" />
                    <span>Add Product</span>
                  </button>
                  <button onClick={() => setActiveTab('coupons')} className="p-3 bg-zinc-950 hover:bg-[#0F9D58] hover:text-white border border-zinc-800 rounded-2xl text-xs font-bold text-zinc-300 transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer group">
                    <Percent size={18} className="text-emerald-400 group-hover:text-white" />
                    <span>Create Coupon</span>
                  </button>
                  <button onClick={() => setActiveTab('categories')} className="p-3 bg-zinc-950 hover:bg-[#0F9D58] hover:text-white border border-zinc-800 rounded-2xl text-xs font-bold text-zinc-300 transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer group">
                    <Layers size={18} className="text-blue-400 group-hover:text-white" />
                    <span>Add Category</span>
                  </button>
                  <button onClick={() => setActiveTab('blog')} className="p-3 bg-zinc-950 hover:bg-[#0F9D58] hover:text-white border border-zinc-800 rounded-2xl text-xs font-bold text-zinc-300 transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer group">
                    <FileText size={18} className="text-indigo-400 group-hover:text-white" />
                    <span>Publish Blog</span>
                  </button>
                  <button onClick={() => setActiveTab('affiliates')} className="p-3 bg-zinc-950 hover:bg-[#0F9D58] hover:text-white border border-zinc-800 rounded-2xl text-xs font-bold text-zinc-300 transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer group">
                    <Coins size={18} className="text-amber-400 group-hover:text-white" />
                    <span>Approve Affiliate</span>
                  </button>
                  <button onClick={() => setActiveTab('notifications')} className="p-3 bg-zinc-950 hover:bg-[#0F9D58] hover:text-white border border-zinc-800 rounded-2xl text-xs font-bold text-zinc-300 transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer group">
                    <Send size={18} className="text-purple-400 group-hover:text-white" />
                    <span>Send Broadcast</span>
                  </button>
                </div>
              </div>

              {/* DASHBOARD CHARTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Daily Sales Chart */}
                <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-white">Daily Sales Velocity</h3>
                      <p className="text-[11px] text-zinc-400">Weekly order completion and gross revenue</p>
                    </div>
                    <span className="text-[10px] font-bold bg-[#0F9D58]/10 text-[#0F9D58] px-2.5 py-1 rounded-full border border-[#0F9D58]/20">
                      PKR Volume
                    </span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailySalesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} />
                        <YAxis stroke="#a1a1aa" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px' }} />
                        <Bar dataKey="sales" fill="#0F9D58" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Revenue Chart */}
                <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-white">Monthly Revenue Growth</h3>
                      <p className="text-[11px] text-zinc-400">Cumulative sales trajectory in PKR</p>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20">
                      2026 Trajectory
                    </span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyRevenueData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="month" stroke="#a1a1aa" fontSize={11} />
                        <YAxis stroke="#a1a1aa" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Performance Pie */}
                <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-white">Category Sales Performance</h3>
                  <div className="h-56 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPerformanceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryPerformanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-zinc-400">
                    {categoryPerformanceData.map((cat, idx) => (
                      <div key={`${cat.name}-${idx}`} className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}: {cat.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traffic Sources Breakdown */}
                <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-white">Traffic Acquisition Channels</h3>
                  <div className="space-y-3">
                    {trafficSourcesData.map((src, idx) => (
                      <div key={`${src.name}-${idx}`} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-300 font-bold">{src.name}</span>
                          <span className="text-zinc-400 font-mono">{src.percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${src.percentage}%`, backgroundColor: src.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RECENT ACTIVITY LISTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Latest Orders */}
                <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs text-[#0F9D58] font-bold">
                      View All Orders
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-800/80">
                    {orders.slice(0, 5).map((ord, idx) => (
                      <div key={ord.id ? `${ord.id}-${idx}` : `ord-${idx}`} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white">{ord.id} - {ord.customerName}</p>
                          <p className="text-[10px] text-zinc-400">{ord.date} • {ord.items.length} items</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400 font-mono">Rs. {ord.total.toLocaleString()}</p>
                          <span className={`inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            ord.status === 'Delivered' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Latest Registered Customers */}
                <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white">Recent Customers</h3>
                    <button onClick={() => setActiveTab('customers')} className="text-xs text-[#0F9D58] font-bold">
                      Customer Directory
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-800/80">
                    {customersList.slice(0, 5).map((cust, idx) => (
                      <div key={cust.id || cust.email || `cust-${idx}`} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center">
                            {(cust.name || 'C').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white">{cust.name || 'Customer'}</p>
                            <p className="text-[10px] text-zinc-400">{cust.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white font-mono">{cust.ordersCount} Orders</p>
                          <p className="text-[10px] text-zinc-500">Spent: Rs. {cust.totalSpent.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PRODUCTS TABLE & MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">Inventory Catalog ({products.length})</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Manage products, stock levels, categories, and prices.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => exportToCSV(products, 'products_catalog')} className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1 cursor-pointer">
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                  <button onClick={openAddProductModal} className="bg-[#0F9D58] hover:bg-[#0B7B44] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1 cursor-pointer">
                    <Plus size={14} />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* Table Controls (Search, Filter, Sort) */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-wrap gap-3 items-center justify-between text-xs">
                <div className="flex flex-wrap gap-2 items-center flex-1">
                  <input
                    type="text"
                    placeholder="Search by product title..."
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] text-xs w-48 sm:w-64"
                  />
                  <select
                    value={prodCatFilter}
                    onChange={(e) => setProdCatFilter(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-[#0F9D58]"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map((c, idx) => <option key={`${c}-${idx}`} value={c}>{c}</option>)}
                  </select>

                  <select
                    value={prodStatusFilter}
                    onChange={(e) => setProdStatusFilter(e.target.value as any)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-amber-300 focus:outline-none focus:border-[#0F9D58] font-bold"
                  >
                    <option value="All">All Statuses (Active & Scheduled)</option>
                    <option value="active">🟢 Active Only</option>
                    <option value="scheduled">⏰ Scheduled Only</option>
                    <option value="draft">📝 Drafts Only</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800">
                      <tr>
                        <th className="p-3.5">Product</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Status / Schedule</th>
                        <th className="p-3.5">Price</th>
                        <th className="p-3.5">Stock</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {products
                        .filter(p => (p.name || '').toLowerCase().includes((prodSearch || '').toLowerCase()))
                        .filter(p => prodCatFilter === 'All' || p.category === prodCatFilter)
                        .filter(p => {
                          if (prodStatusFilter === 'All') return true;
                          const currentStat = p.status || (p.scheduledPublishDate ? 'scheduled' : 'active');
                          return currentStat === prodStatusFilter;
                        })
                        .slice((prodPage - 1) * 8, prodPage * 8)
                        .map((p, idx) => {
                          const pStatus = p.status || (p.scheduledPublishDate ? 'scheduled' : 'active');
                          return (
                            <tr key={p.id ? `${p.id}-${idx}` : `p-${idx}`} className="hover:bg-zinc-800/40 transition-colors">
                              <td className="p-3.5 flex items-center space-x-3">
                                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-xl border border-zinc-800 shrink-0" referrerPolicy="no-referrer" />
                                <div className="min-w-0">
                                  <p className="font-bold text-white truncate max-w-xs">{p.name}</p>
                                  <p className="text-[10px] text-zinc-500">ID: {p.id}</p>
                                </div>
                              </td>
                              <td className="p-3.5 font-semibold text-zinc-400">{p.category}</td>
                              <td className="p-3.5">
                                {pStatus === 'scheduled' ? (
                                  <div className="flex items-center space-x-2">
                                    <span className="px-2.5 py-1 rounded-full font-extrabold text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center space-x-1 shrink-0">
                                      <Clock size={11} className="animate-spin text-amber-400" />
                                      <span>
                                        Scheduled: {p.scheduledPublishDate ? new Date(p.scheduledPublishDate).toLocaleString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Future'}
                                      </span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        editProduct({ ...p, status: 'active', scheduledPublishDate: undefined });
                                        addNotification('Product Published Now 🚀', `"${p.name}" is now live on the store!`, 'success');
                                      }}
                                      className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-800 border border-emerald-600/50 text-emerald-300 text-[9px] font-black rounded-lg cursor-pointer transition-all"
                                      title="Publish product immediately now"
                                    >
                                      Publish Now 🚀
                                    </button>
                                  </div>
                                ) : pStatus === 'draft' ? (
                                  <span className="px-2.5 py-1 rounded-full font-extrabold text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">
                                    📝 Draft
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full font-extrabold text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                    🟢 Active Live
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 font-bold text-emerald-400 font-mono">Rs. {p.price.toLocaleString()}</td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  p.stock <= 5 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                  {p.stock} units
                                </span>
                              </td>
                              <td className="p-3.5 text-right space-x-1.5">
                                <button
                                  onClick={() => setSeoProductModal(p)}
                                  className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 rounded-lg hover:bg-emerald-900/50 transition-colors"
                                  title="Edit Product Image SEO & Meta"
                                >
                                  <Sparkles size={14} />
                                </button>
                                <button
                                  onClick={() => openEditProductModal(p)}
                                  className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                                  title="Edit Product Details"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteProductModal(p)}
                                  className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/30 rounded-lg hover:bg-red-900/50 transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Page {prodPage}</span>
                  <div className="flex space-x-2">
                    <button disabled={prodPage === 1} onClick={() => setProdPage(p => p - 1)} className="p-1.5 bg-zinc-900 text-zinc-300 rounded-lg disabled:opacity-40">
                      <ChevronLeft size={16} />
                    </button>
                    <button disabled={prodPage * 8 >= products.length} onClick={() => setProdPage(p => p + 1)} className="p-1.5 bg-zinc-900 text-zinc-300 rounded-lg disabled:opacity-40">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CATEGORIES */}
          {/* ========================================================= */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-white">Product Categories ({CATEGORIES.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((cat, idx) => {
                  const catProducts = products.filter(p => p.category === cat);
                  return (
                    <div key={`${cat}-${idx}`} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-white text-sm">{cat}</h3>
                        <p className="text-xs text-zinc-400 mt-1">{catProducts.length} Products Registered</p>
                      </div>
                      <span className="p-3 bg-zinc-800 text-[#0F9D58] rounded-xl font-bold font-mono text-sm">
                        {catProducts.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: ORDERS */}
          {/* ========================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">Order Fulfillment & Realtime Sales ({orders.length})</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Realtime live incoming orders synced with Firebase Cloud.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => exportToCSV(orders, 'orders_export')} className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1 cursor-pointer">
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Table Controls (Search & Status Filter) */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-wrap gap-3 items-center justify-between text-xs">
                <div className="flex flex-wrap gap-2 items-center flex-1">
                  <input
                    type="text"
                    placeholder="Search by Order ID, Name, Phone, City..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] text-xs w-48 sm:w-72"
                  />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-[#0F9D58]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending (نئے آرڈرز)</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="text-zinc-400 text-xs font-mono">
                  Showing {
                    orders
                      .filter(o => {
                        const q = (orderSearch || '').toLowerCase();
                        const idMatch = (o.id || '').toLowerCase().includes(q);
                        const nameMatch = (o.customerName || o.shippingAddress?.fullName || '').toLowerCase().includes(q);
                        const phoneMatch = (o.shippingAddress?.phone || '').toLowerCase().includes(q);
                        const cityMatch = (o.shippingAddress?.city || '').toLowerCase().includes(q);
                        return idMatch || nameMatch || phoneMatch || cityMatch;
                      })
                      .filter(o => orderStatusFilter === 'All' || o.status === orderStatusFilter).length
                  } Orders
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800">
                      <tr>
                        <th className="p-3.5">Order ID & Date</th>
                        <th className="p-3.5">Customer & Contact</th>
                        <th className="p-3.5">Items & Payment</th>
                        <th className="p-3.5">Total Amount</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {orders
                        .filter(o => {
                          const q = (orderSearch || '').toLowerCase();
                          const idMatch = (o.id || '').toLowerCase().includes(q);
                          const nameMatch = (o.customerName || o.shippingAddress?.fullName || '').toLowerCase().includes(q);
                          const phoneMatch = (o.shippingAddress?.phone || '').toLowerCase().includes(q);
                          const cityMatch = (o.shippingAddress?.city || '').toLowerCase().includes(q);
                          return idMatch || nameMatch || phoneMatch || cityMatch;
                        })
                        .filter(o => orderStatusFilter === 'All' || o.status === orderStatusFilter)
                        .map((o, idx) => {
                          const custName = o.shippingAddress?.fullName || o.customerName || 'Customer';
                          const custPhone = o.shippingAddress?.phone || '';
                          const custCity = o.shippingAddress?.city || 'Pakistan';
                          const itemCount = o.items?.reduce((s, i) => s + (i.quantity || 1), 0) || o.items?.length || 1;

                          return (
                            <tr key={o.id ? `${o.id}-${idx}` : `ord-${idx}`} className="hover:bg-zinc-800/40 transition-colors">
                              <td className="p-3.5">
                                <span className="font-mono font-black text-white bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800 block w-max mb-1">
                                  {o.id}
                                </span>
                                <span className="text-[10px] text-zinc-500">{o.date || 'Recent'}</span>
                              </td>
                              <td className="p-3.5">
                                <p className="font-bold text-white flex items-center space-x-1.5">
                                  <span>{custName}</span>
                                </p>
                                <p className="text-[11px] text-emerald-400 font-mono mt-0.5">{custPhone}</p>
                                <p className="text-[10px] text-zinc-500">{custCity}</p>
                              </td>
                              <td className="p-3.5">
                                <p className="font-semibold text-zinc-200">{itemCount} items</p>
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 font-mono">
                                  {o.paymentMethod || 'Cash on Delivery'}
                                </span>
                              </td>
                              <td className="p-3.5 font-bold text-emerald-400 font-mono text-sm">
                                Rs. {o.total?.toLocaleString()}
                              </td>
                              <td className="p-3.5">
                                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider block w-max ${
                                  o.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                  o.status === 'Shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                  o.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-right space-y-1.5">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => setSelectedOrderDetails(o)}
                                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                                  >
                                    <Eye size={12} />
                                    <span>Details</span>
                                  </button>
                                  <select
                                    value={o.status}
                                    onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-[#0F9D58]"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {orders.length === 0 && (
                  <div className="p-12 text-center text-zinc-500 space-y-3">
                    <ShoppingCart size={40} className="mx-auto opacity-30 text-[#0F9D58]" />
                    <p className="text-sm font-bold text-zinc-400">No Orders Found Yet</p>
                    <p className="text-xs max-w-sm mx-auto">When customers place orders via Cash on Delivery or Raast, they will appear here instantly in realtime.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: CUSTOMERS */}
          {/* ========================================================= */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-white">Customer Directory ({customersList.length})</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Contact</th>
                      <th className="p-3.5">City</th>
                      <th className="p-3.5">Orders</th>
                      <th className="p-3.5">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {customersList.map((c, idx) => (
                      <tr key={c.id || c.email || `cust-table-${idx}`} className="hover:bg-zinc-800/40">
                        <td className="p-3.5 font-bold text-white">{c.name}</td>
                        <td className="p-3.5 text-zinc-400">{c.email}<br/><span className="text-[10px] text-zinc-500">{c.phone}</span></td>
                        <td className="p-3.5 text-zinc-300">{c.city}</td>
                        <td className="p-3.5 font-bold text-white font-mono">{c.ordersCount}</td>
                        <td className="p-3.5 font-bold text-emerald-400 font-mono">Rs. {c.totalSpent.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: AFFILIATE PROGRAM */}
          {/* ========================================================= */}
          {activeTab === 'affiliates' && (
            <div className="animate-in fade-in duration-300">
              <EnterpriseAffiliateModule />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: COUPONS */}
          {/* ========================================================= */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-white">Coupons & Promo Codes ({allCoupons.length})</h2>
              
              <form onSubmit={handleCreateCoupon} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-wrap gap-3 items-center">
                <input
                  type="text"
                  placeholder="COUPON CODE (e.g. PAK10)"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#0F9D58]"
                />
                <input
                  type="number"
                  placeholder="Discount %"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0F9D58] w-28"
                />
                <button type="submit" className="bg-[#0F9D58] text-white text-xs font-bold px-4 py-2 rounded-xl">
                  Create Coupon
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCoupons.map((c, idx) => (
                  <div key={c.code ? `${c.code}-${idx}` : `coupon-${idx}`} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <h3 className="font-mono font-bold text-emerald-400 text-sm">{c.code}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{c.discountPercentage}% OFF (Min spend: Rs. {c.minPurchase})</p>
                    </div>
                    <button onClick={() => deleteCoupon(c.code)} className="text-red-400 hover:text-red-300 p-1.5 bg-red-950/30 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: REVIEWS */}
          {/* ========================================================= */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-white">Product Reviews ({reviews.length})</h2>
              <div className="divide-y divide-zinc-800 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                {reviews.map((r, idx) => (
                  <div key={r.id ? `${r.id}-${idx}` : `rev-${idx}`} className="p-4 flex justify-between items-start text-xs">
                    <div>
                      <p className="font-bold text-white">{r.userName} <span className="text-amber-400 font-bold">★ {r.rating}</span></p>
                      <p className="text-zinc-300 mt-1">{r.comment}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">{r.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 9: BLOG */}
          {/* ========================================================= */}
          {/* TAB 9: BLOG CMS (WordPress Engine & Rank Math SEO Suite) */}
          {/* ========================================================= */}
          {activeTab === 'blog' && (
            <WordPressBlogManager />
          )}

          {/* ========================================================= */}
          {/* TAB 10: INVENTORY */}
          {/* ========================================================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-white">Stock Audit & Low Stock Alerts</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <h3 className="font-bold text-amber-400 text-xs mb-3">Items Requiring Re-stock (&le; 5 units)</h3>
                <div className="space-y-2">
                  {products.filter(p => p.stock <= 5).map((p, idx) => (
                    <div key={p.id ? `${p.id}-${idx}` : `stock-${idx}`} className="p-3 bg-zinc-950 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{p.name}</span>
                      <span className="font-mono font-bold text-red-400">{p.stock} remaining</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 11: REPORTS */}
          {/* ========================================================= */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-white">Financial & Logistics Reports</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => exportToCSV(orders, 'sales_ledger')} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl text-left space-y-2 hover:border-[#0F9D58] transition-colors cursor-pointer">
                  <FileSpreadsheet size={24} className="text-[#0F9D58]" />
                  <h3 className="font-bold text-white text-sm">Download Sales Ledger CSV</h3>
                  <p className="text-xs text-zinc-400">Complete breakdown of all completed and pending customer orders.</p>
                </button>
                <button onClick={() => exportToCSV(products, 'inventory_report')} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl text-left space-y-2 hover:border-[#0F9D58] transition-colors cursor-pointer">
                  <Boxes size={24} className="text-blue-400" />
                  <h3 className="font-bold text-white text-sm">Download Inventory Audit CSV</h3>
                  <p className="text-xs text-zinc-400">Detailed stock counts, category listings, and retail pricing.</p>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 12: ANALYTICS & LIVE TRAFFIC */}
          {/* ========================================================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <LiveTrafficMonitor />
            </div>
          )}

          {activeTab === 'live-traffic' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <LiveTrafficMonitor />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 13: REVENUE */}
          {/* ========================================================= */}
          {activeTab === 'revenue' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-white">Revenue Ledger</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                  <p className="text-xs text-zinc-400 font-bold uppercase">Gross Revenue</p>
                  <h3 className="text-xl font-mono font-black text-emerald-400 mt-1">Rs. {totalSales.toLocaleString()}</h3>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                  <p className="text-xs text-zinc-400 font-bold uppercase">Cash on Delivery (COD)</p>
                  <h3 className="text-xl font-mono font-black text-teal-400 mt-1">Rs. {Math.round(totalSales * 0.75).toLocaleString()}</h3>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                  <p className="text-xs text-zinc-400 font-bold uppercase">Affiliate Commissions Paid</p>
                  <h3 className="text-xl font-mono font-black text-amber-400 mt-1">Rs. {Math.round(totalSales * 0.08).toLocaleString()}</h3>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 14: NOTIFICATIONS */}
          {/* ========================================================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-white">Send System Broadcast</h2>
              <form onSubmit={handleSendBroadcast} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3 text-xs">
                <input type="text" placeholder="Broadcast Title" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white" />
                <textarea placeholder="Broadcast Message..." value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white h-20" />
                <button type="submit" className="bg-[#0F9D58] text-white font-bold px-4 py-2 rounded-xl">Send Notification</button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 15: MESSAGES */}
          {/* ========================================================= */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-white">Support Messages Inbox ({inquiries.length})</h2>
              <div className="space-y-3">
                {inquiries.map((inq, idx) => (
                  <div key={inq.id ? `${inq.id}-${idx}` : `inq-inbox-${idx}`} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center font-bold text-white">
                      <span>{inq.customer} ({inq.email})</span>
                      <span className="text-zinc-500">{inq.date}</span>
                    </div>
                    <p className="font-bold text-emerald-400">{inq.subject}</p>
                    <p className="text-zinc-300">{inq.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 16: SETTINGS */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-white">Platform Settings & Passkeys</h2>
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4 text-xs">
                <h3 className="font-bold text-white">Admin Authentication Credentials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 font-bold block mb-1">Admin Email</label>
                    <input type="email" value={adminEmailInput} onChange={e => setAdminEmailInput(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white" />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-bold block mb-1">Admin Passkey</label>
                    <input type="password" value={adminPasswordInput} onChange={e => setAdminPasswordInput(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white" />
                  </div>
                </div>
                <button
                  onClick={() => {
                    updateAdminCredentials(adminEmailInput, adminPasswordInput);
                    addNotification('Credentials Updated', 'Admin passkey saved successfully.', 'success');
                  }}
                  className="bg-[#0F9D58] text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Save Passkey
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 17: PROFILE */}
          {/* ========================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-white">Administrator Security Profile</h2>
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4 text-xs">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0F9D58] to-emerald-600 flex items-center justify-center font-black text-white text-xl">
                    A
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Admin Manager</h3>
                    <p className="text-zinc-400">{adminEmail}</p>
                    <span className="inline-block mt-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]">
                      Root Administrator
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CMS TABS */}
          {/* ========================================================= */}
          {activeTab === 'cms-branding' && <WebsiteBrandingManager />}
          {activeTab === 'cms-hero' && <HeroBannerManager />}
          {activeTab === 'cms-categories' && <CategoryManagerCMS />}
          {activeTab === 'cms-media' && <MediaLibraryView />}
          {activeTab === 'cms-seo' && <SeoManagerCMS />}
          {activeTab === 'workers' && <WorkerManagementCMS />}

        </main>
      </div>

      {/* PRODUCT UPLOAD & SEO PUBLISHER MODAL */}
      {quickAddProductOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 text-left animate-in zoom-in-95 duration-200 shadow-2xl my-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-black text-white text-base sm:text-lg flex items-center space-x-2">
                  <Package className="w-5 h-5 text-[#0F9D58]" />
                  <span>{editingProductId ? 'Edit Product & Google Search SEO' : 'Upload Product & Setup Search Ranking'}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Setup product pricing, original price, image alt tags, and meta description to rank higher on Google Search & Images.
                </p>
              </div>
              <button 
                onClick={() => setQuickAddProductOpen(false)} 
                className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-6 text-xs">
              
              {/* SECTION 1: BASIC PRODUCT INFORMATION */}
              <div className="space-y-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                  <FileText size={14} />
                  <span>1. Product Details & Pricing</span>
                </h4>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Product Title (نام) *</label>
                  <input
                    required
                    type="text"
                    value={pName}
                    onChange={e => setPName(e.target.value)}
                    placeholder="e.g. Sialkot Willow Heavy Duty Tapball Cricket Bat"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] font-medium text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-300 font-bold block mb-1">Current Sale Price (PKR / موجودہ قیمت) *</label>
                    <input
                      required
                      type="number"
                      min={1}
                      value={pPrice || ''}
                      onChange={e => setPPrice(Number(e.target.value))}
                      placeholder="e.g. 1999"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-[#0F9D58] text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-bold block mb-1">Original Price (PKR / کٹ آف اصل قیمت - Optional)</label>
                    <input
                      type="number"
                      min={0}
                      value={pOriginalPrice || ''}
                      onChange={e => setPOriginalPrice(Number(e.target.value))}
                      placeholder="e.g. 2999 (For -33% OFF badge)"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-[#0F9D58] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-300 font-bold block mb-1">Category (کیٹیگری) *</label>
                    <select
                      value={pCategory}
                      onChange={e => setPCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#0F9D58] text-xs"
                    >
                      {CATEGORIES.map((c, idx) => <option key={`${c}-${idx}`} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-300 font-bold block mb-1">Stock Quantity (موجودہ اسٹاک) *</label>
                    <input
                      required
                      type="number"
                      min={0}
                      value={pStock}
                      onChange={e => setPStock(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#0F9D58] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Product Description (مصنوعات کی تفصیل - Optional)</label>
                  <textarea
                    rows={3}
                    value={pDescription}
                    onChange={e => setPDescription(e.target.value)}
                    placeholder="Enter detailed features, specifications, and warranty info..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] text-xs"
                  />
                </div>
              </div>

              {/* SECTION 2: MULTI-IMAGE GALLERY UPLOAD & IMAGE SEO */}
              <div className="space-y-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                    <Image size={14} />
                    <span>2. Product Images Gallery (ایک سے زائد تصاویر اپلوڈ کریں)</span>
                  </h4>
                  <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full font-bold">
                    {pImages.length} Image(s) Added
                  </span>
                </div>

                {/* Upload Buttons Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-center space-x-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-600/40 border-dashed rounded-xl p-3 cursor-pointer transition-all text-emerald-300 font-bold text-xs">
                    <Plus size={16} />
                    <span>Upload Multiple Files (کمپیوٹر / موبائل سے لیں)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleMultiFileUpload(e.target.files)}
                    />
                  </label>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newImageUrlInput}
                      onChange={e => setNewImageUrlInput(e.target.value)}
                      placeholder="Or paste Image URL..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-3 py-2.5 rounded-xl text-xs shrink-0 cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Uploaded Gallery Thumbnails */}
                {pImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-zinc-400 flex flex-wrap items-center justify-between gap-1">
                      <span>Uploaded Product Images (پہلی تصویر ہوم پیج پر نظر آئے گی):</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">⚡ Click "Edit Size / Preview" to adjust zoom, fit & background</span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 p-2 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                      {pImages.map((imgUrl, idx) => {
                        const isMain = imgUrl === pImage || (!pImage && idx === 0);
                        return (
                          <div 
                            key={idx} 
                            className={`relative group rounded-xl overflow-hidden border-2 transition-all bg-zinc-950 aspect-square flex flex-col justify-between ${
                              isMain ? 'border-emerald-500 shadow-lg shadow-emerald-950/50 scale-[1.02]' : 'border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <img 
                              src={imgUrl} 
                              alt={`Product image ${idx + 1}`} 
                              className="w-full h-full object-contain p-1" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=300&q=80';
                              }}
                            />

                            {/* Badge */}
                            {isMain && (
                              <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow z-10">
                                Main Cover
                              </span>
                            )}

                            {/* Hover Controls Overlay */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 space-y-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleOpenCropper(idx, imgUrl)}
                                className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg shadow transition-all flex items-center justify-center space-x-1 cursor-pointer"
                                title="Adjust Size, Scale, Fit & Preview"
                              >
                                <Eye size={12} />
                                <span>Edit Size & Preview</span>
                              </button>

                              <div className="flex items-center space-x-1">
                                {!isMain && (
                                  <button
                                    type="button"
                                    onClick={() => setPImage(imgUrl)}
                                    className="p-1 bg-zinc-800 hover:bg-emerald-700 text-white rounded-lg cursor-pointer text-[9px] font-bold px-2"
                                    title="Set as Main Cover Image"
                                  >
                                    Set Main
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="p-1 bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer"
                                  title="Remove Image"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-300 font-bold block mb-1">Image Alt Text (تصویر کا Alt Tag - Google Search) *</label>
                    <input
                      type="text"
                      value={pImageAlt}
                      onChange={e => setPImageAlt(e.target.value)}
                      placeholder="e.g. Sialkot Willow Cricket Bat Original Pakistan"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] text-xs"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">Helps Google rank your image in Google Image Search.</p>
                  </div>

                  <div>
                    <label className="text-zinc-300 font-bold block mb-1">Image Title Attribute</label>
                    <input
                      type="text"
                      value={pImageTitle}
                      onChange={e => setPImageTitle(e.target.value)}
                      placeholder="e.g. Hover tooltip description"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: GOOGLE SEARCH RANKING & META TAGS */}
              <div className="space-y-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                    <Globe size={14} />
                    <span>3. Google Search Meta Tags & Keywords (SEO)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAutoGenerateSEO}
                    className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all self-start sm:self-auto"
                  >
                    <Sparkles size={13} className="text-emerald-400 animate-pulse" />
                    <span>⚡ Auto-Generate Google SEO</span>
                  </button>
                </div>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Meta Title (گوگل سرچ کا ٹائٹل - Max 60 chars)</label>
                  <input
                    type="text"
                    value={pSeoTitle}
                    onChange={e => setPSeoTitle(e.target.value)}
                    placeholder="e.g. Sialkot Willow Cricket Bat - Buy Online in Pakistan | Pak-Tajarat"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] text-xs"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Meta Description (گوگل سرچ کی مختصر تفصیل - Max 160 chars)</label>
                  <textarea
                    rows={2}
                    value={pSeoDescription}
                    onChange={e => setPSeoDescription(e.target.value)}
                    placeholder="e.g. Buy original Sialkot Willow Cricket Bat online at best price in Pakistan with fast Cash on Delivery & 7-day returns on Pak-Tajarat."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] text-xs"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Meta Keywords (تلاش کے اہم الفاظ - Comma Separated)</label>
                  <input
                    type="text"
                    value={pSeoKeywords}
                    onChange={e => setPSeoKeywords(e.target.value)}
                    placeholder="e.g. cricket bat, sialkot willow, buy cricket bat online pakistan, pak-tajarat"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] text-xs"
                  />
                </div>
              </div>

              {/* SECTION 3B: MARKETING TOGGLES & AFFILIATE COMMISSION */}
              <div className="space-y-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles size={14} />
                  <span>3B. Marketing Badges & Affiliate Commission Settings</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={pIsFlashSale}
                      onChange={e => setPIsFlashSale(e.target.checked)}
                      className="rounded text-[#0F9D58] focus:ring-[#0F9D58] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white">⚡ Flash Sale</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={pIsFeatured}
                      onChange={e => setPIsFeatured(e.target.checked)}
                      className="rounded text-[#0F9D58] focus:ring-[#0F9D58] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white">🌟 Featured Item</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={pIsBestSeller}
                      onChange={e => setPIsBestSeller(e.target.checked)}
                      className="rounded text-[#0F9D58] focus:ring-[#0F9D58] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white">🔥 Best Seller</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={pIsNewArrival}
                      onChange={e => setPIsNewArrival(e.target.checked)}
                      className="rounded text-[#0F9D58] focus:ring-[#0F9D58] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white">✨ New Arrival</span>
                  </label>
                </div>

                {/* Affiliate Settings */}
                <div className="pt-3 border-t border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">Enable Affiliate Promotion Program</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pAffiliateEnabled}
                        onChange={e => setPAffiliateEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F9D58]"></div>
                    </label>
                  </div>

                  {pAffiliateEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                      <div>
                        <label className="text-zinc-400 font-bold block mb-1">Commission Type</label>
                        <select
                          value={pCommissionType}
                          onChange={e => setPCommissionType(e.target.value as any)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#0F9D58]"
                        >
                          <option value="percentage">Percentage (%) of Sale Price</option>
                          <option value="fixed">Fixed PKR Amount Per Order</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-zinc-400 font-bold block mb-1">Commission Value ({pCommissionType === 'percentage' ? '%' : 'PKR'})</label>
                        <input
                          type="number"
                          min={0}
                          value={pCommissionValue}
                          onChange={e => setPCommissionValue(Number(e.target.value))}
                          placeholder={pCommissionType === 'percentage' ? '10' : '500'}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-[#0F9D58]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3C: PRODUCT SPECIFICATIONS */}
              <div className="space-y-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                  <Boxes size={14} />
                  <span>3C. Technical Specifications (تکنیکی تفصیلات - Key: Value format per line)</span>
                </h4>
                <textarea
                  rows={3}
                  value={pSpecsText}
                  onChange={e => setPSpecsText(e.target.value)}
                  placeholder={'Display: 1.43" AMOLED\nBattery: 10 Days Backup\nWarranty: 1 Year Official'}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-[#0F9D58]"
                />
                <p className="text-[10px] text-zinc-500">
                  Write key-value pairs separated by a colon on each line (e.g. <span className="text-zinc-300">Display: 6.5" OLED</span>).
                </p>
              </div>

              {/* SECTION 4: PUBLISHING & AUTOMATED SCHEDULING */}
              <div className="space-y-4 bg-zinc-950/80 p-4 rounded-2xl border border-emerald-900/40 shadow-inner">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                    <Clock size={15} className="text-amber-400" />
                    <span>4. Publishing & Schedule Settings (پبلشنگ اور آٹو شیڈولنگ)</span>
                  </h4>
                  <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-full font-bold">
                    Auto-Publish Ticker Active ⏰
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPPublishType('now')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      pPublishType === 'now'
                        ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs">🚀 Publish Now</span>
                      {pPublishType === 'now' && <CheckCircle size={14} className="text-emerald-400" />}
                    </div>
                    <p className="text-[10px] opacity-80 leading-tight">پروڈکٹ فوری طور پر سٹور پر لائیو ہو جائے گی (Immediate Live)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPPublishType('scheduled')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      pPublishType === 'scheduled'
                        ? 'bg-amber-950/80 border-amber-500 text-white shadow-md shadow-amber-950/50'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-amber-300">⏰ Schedule Publishing</span>
                      {pPublishType === 'scheduled' && <CheckCircle size={14} className="text-amber-400" />}
                    </div>
                    <p className="text-[10px] opacity-80 leading-tight">مقررہ وقت پر آٹو پبلش کریں (Auto-Publish at Date/Time)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPPublishType('draft')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      pPublishType === 'draft'
                        ? 'bg-zinc-800 border-zinc-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs">📝 Save as Draft</span>
                      {pPublishType === 'draft' && <CheckCircle size={14} className="text-zinc-300" />}
                    </div>
                    <p className="text-[10px] opacity-80 leading-tight">سٹور پر ظاہر نہیں ہوگی، بعد میں ایڈٹ کریں (Draft Only)</p>
                  </button>
                </div>

                {/* SCHEDULED DATE TIME PICKER */}
                {pPublishType === 'scheduled' && (
                  <div className="p-3.5 bg-amber-950/30 border border-amber-800/40 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <label className="text-xs font-bold text-amber-200 block">
                      پبلش کرنے کی تاریخ اور وقت منتخب کریں (Select Target Publish Date & Time) *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        type="datetime-local"
                        value={pScheduledDate}
                        onChange={e => setPScheduledDate(e.target.value)}
                        className="w-full sm:w-auto bg-zinc-900 border border-amber-800/60 rounded-xl p-2.5 text-amber-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                        required={pPublishType === 'scheduled'}
                      />
                      <p className="text-[11px] text-amber-300/80 leading-relaxed">
                        ⚡ جیسے ہی یہ وقت آئے گا، پروڈکٹ سٹور پر خود بخود پبلش ہو جائے گی۔
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setQuickAddProductOpen(false)}
                  className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#0F9D58] hover:bg-[#0B7B44] text-white text-xs font-black shadow-lg hover:shadow-emerald-900/30 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <CheckCircle size={16} />
                  <span>{editingProductId ? 'Save Changes & Update SEO' : 'Publish Product & Enable Search Ranking'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PRODUCT IMAGE SEO MODAL */}
      {seoProductModal && (
        <ProductImageSeoModal
          product={seoProductModal}
          onClose={() => setSeoProductModal(null)}
        />
      )}

      {/* ADMIN IMAGE CROPPER & LIVE PREVIEW MODAL */}
      <AdminImageCropperModal
        isOpen={cropperModalOpen}
        imageUrl={cropperImageUrl}
        onClose={() => setCropperModalOpen(false)}
        onSave={handleSaveCroppedImage}
        productName={pName || 'Product Title Preview'}
        productPrice={pPrice || 2999}
      />

      {/* DELETE PRODUCT CONFIRMATION POPUP MODAL */}
      {confirmDeleteProductModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center space-x-3 text-red-500">
              <div className="p-3 bg-red-950/60 border border-red-800/40 rounded-2xl">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Delete Product?</h3>
                <p className="text-xs text-zinc-400">کیا آپ اس پروڈکٹ کو ختم کرنا چاہتے ہیں؟</p>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center space-x-3">
              {confirmDeleteProductModal.image && (
                <img
                  src={confirmDeleteProductModal.image}
                  alt={confirmDeleteProductModal.name}
                  className="w-12 h-12 object-cover rounded-xl border border-zinc-800 shrink-0"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-zinc-200 truncate">{confirmDeleteProductModal.name}</p>
                <p className="text-xs text-emerald-400 font-semibold">Rs. {confirmDeleteProductModal.price.toLocaleString()}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-bold">{confirmDeleteProductModal.name}</span>? This action will permanently remove it from the store.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setConfirmDeleteProductModal(null)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
              >
                No / Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(confirmDeleteProductModal.id);
                  setConfirmDeleteProductModal(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-900/30 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS POPUP MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" id="admin-order-details-modal">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0F9D58] font-bold">Order Details & Dispatch</span>
                <h3 className="text-xl font-black text-white flex items-center space-x-2 mt-0.5">
                  <span>Order #{selectedOrderDetails.id}</span>
                </h3>
                <p className="text-xs text-zinc-400">{selectedOrderDetails.date || 'Placed recently'}</p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer Information & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
                <p className="text-[11px] font-bold text-zinc-500 uppercase">Customer Information</p>
                <p className="text-sm font-bold text-white">
                  {selectedOrderDetails.shippingAddress?.fullName || selectedOrderDetails.customerName || 'Customer'}
                </p>
                <p className="text-xs text-emerald-400 font-mono">
                  📞 {selectedOrderDetails.shippingAddress?.phone || 'No phone provided'}
                </p>
                <p className="text-xs text-zinc-400">
                  📍 {selectedOrderDetails.shippingAddress?.addressLine || 'Address not listed'}, {selectedOrderDetails.shippingAddress?.city || ''}
                </p>
                {selectedOrderDetails.shippingAddress?.zipCode && (
                  <p className="text-[11px] text-zinc-500 font-mono">Postal Code: {selectedOrderDetails.shippingAddress.zipCode}</p>
                )}
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
                <p className="text-[11px] font-bold text-zinc-500 uppercase">Payment & Status</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Method:</span>
                  <span className="text-xs font-bold text-white font-mono">{selectedOrderDetails.paymentMethod || 'Cash on Delivery'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                    selectedOrderDetails.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                    selectedOrderDetails.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400' :
                    selectedOrderDetails.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {selectedOrderDetails.status}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2 mt-2">
                  <span className="text-xs font-bold text-zinc-300">Total Bill:</span>
                  <span className="text-sm font-mono font-black text-emerald-400">Rs. {selectedOrderDetails.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ordered Products</p>
              <div className="divide-y divide-zinc-800 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                {selectedOrderDetails.items?.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between space-x-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      {item.product?.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-zinc-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.product?.name || 'Product'}</p>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          Rs. {item.product?.price?.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold font-mono text-white">
                        Rs. {((item.product?.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct WhatsApp Contact & Status Updater */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800">
              {selectedOrderDetails.shippingAddress?.phone ? (
                <a
                  href={`https://wa.me/${selectedOrderDetails.shippingAddress.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`As-salamu alaykum ${selectedOrderDetails.shippingAddress.fullName || ''}! We received your order #${selectedOrderDetails.id} on Pak-Tajarat for Rs. ${selectedOrderDetails.total?.toLocaleString()}. We are confirming shipment.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <MessageSquare size={14} />
                  <span>WhatsApp Customer</span>
                </a>
              ) : (
                <div />
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                  title="Print Packing Slip / Invoice"
                >
                  <Printer size={14} />
                  <span>Print Slip</span>
                </button>
                <span className="text-xs text-zinc-400">Change Status:</span>
                <select
                  value={selectedOrderDetails.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as Order['status'];
                    updateOrderStatus(selectedOrderDetails.id, newStatus);
                    setSelectedOrderDetails(prev => prev ? { ...prev, status: newStatus } : null);
                  }}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0F9D58] font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
