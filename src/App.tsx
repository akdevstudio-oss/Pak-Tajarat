import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AppProvider, useApp, useAffiliate } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { QuickViewModal } from './components/QuickViewModal';
import { AiCustomerChatbot } from './components/AiCustomerChatbot';

import { PageSkeletonLoader } from './components/PageSkeletonLoader';

// Eagerly load primary home view for instant load
import { HomeView } from './pages/HomeView';

// Lazy load remaining pages for bundle splitting & optimal performance
const ProductsView = React.lazy(() => import('./pages/ProductsView').then(m => ({ default: m.ProductsView })));
const ProductDetailsView = React.lazy(() => import('./pages/ProductDetailsView').then(m => ({ default: m.ProductDetailsView })));
const CartView = React.lazy(() => import('./pages/CartView').then(m => ({ default: m.CartView })));
const CheckoutView = React.lazy(() => import('./pages/CheckoutView').then(m => ({ default: m.CheckoutView })));
const AuthView = React.lazy(() => import('./pages/AuthView').then(m => ({ default: m.AuthView })));
const UserDashboardView = React.lazy(() => import('./pages/UserDashboardView').then(m => ({ default: m.UserDashboardView })));
const AdminDashboardView = React.lazy(() => import('./pages/AdminDashboardView').then(m => ({ default: m.AdminDashboardView })));
const AdminLoginView = React.lazy(() => import('./pages/AdminLoginView').then(m => ({ default: m.AdminLoginView })));
const AffiliatePortalView = React.lazy(() => import('./pages/AffiliatePortalView').then(m => ({ default: m.AffiliatePortalView })));
const AboutView = React.lazy(() => import('./pages/AboutView').then(m => ({ default: m.AboutView })));
const ContactView = React.lazy(() => import('./pages/ContactView').then(m => ({ default: m.ContactView })));
const BlogView = React.lazy(() => import('./pages/BlogView').then(m => ({ default: m.BlogView })));
const BlogDetailsView = React.lazy(() => import('./pages/BlogDetailsView').then(m => ({ default: m.BlogDetailsView })));
const PrivacyView = React.lazy(() => import('./pages/PolicyViews').then(m => ({ default: m.PrivacyView })));
const TermsView = React.lazy(() => import('./pages/PolicyViews').then(m => ({ default: m.TermsView })));
const RefundView = React.lazy(() => import('./pages/PolicyViews').then(m => ({ default: m.RefundView })));
const FaqView = React.lazy(() => import('./pages/PolicyViews').then(m => ({ default: m.FaqView })));
const NotFoundView = React.lazy(() => import('./pages/ErrorViews').then(m => ({ default: m.NotFoundView })));
const InternalServerErrorView = React.lazy(() => import('./pages/ErrorViews').then(m => ({ default: m.InternalServerErrorView })));

import { Bell, X } from 'lucide-react';
import { useLiveTrafficTracker } from './hooks/useLiveTrafficTracker';

const AppContent: React.FC = () => {
  const { currentView, notifications, markNotificationRead, setCurrentView, setActiveDashboardTab, currentUser } = useApp();
  const { trackReferralClick, processCoolingCommissions } = useAffiliate();

  // Mount real-time live visitor and site-wide click tracker
  useLiveTrafficTracker(currentView, currentUser);

  // Handle URL referral codes and cooling period check on mount
  React.useEffect(() => {
    processCoolingCommissions();

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const refCode = searchParams.get('ref') || searchParams.get('referral');
      const pid = searchParams.get('pid') || searchParams.get('product');

      if (refCode) {
        trackReferralClick(refCode).then(affId => {
          const finalId = affId || refCode;
          sessionStorage.setItem('paktajarat_ref_affiliate_id', finalId);
          localStorage.setItem('paktajarat_ref_affiliate_id', finalId);
        });
      }

      if (pid) {
        localStorage.setItem('pak_tajarat_selected_product_id', pid);
        setCurrentView('product-details');
      }
    } catch (err) {
      console.warn("URL referral param error:", err);
    }
  }, []);

  // Track which notifications should be displayed in the floating toasts
  const [visibleToasts, setVisibleToasts] = React.useState<string[]>([]);
  const shownToastIdsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const unread = notifications.filter(n => !n.read);
    const newToastsToTrigger = unread.filter(n => !shownToastIdsRef.current.has(n.id));

    if (newToastsToTrigger.length > 0) {
      const newIds: string[] = [];
      newToastsToTrigger.forEach(t => {
        shownToastIdsRef.current.add(t.id);
        newIds.push(t.id);
      });
      setVisibleToasts(prev => [...prev, ...newIds]);

      newIds.forEach(id => {
        setTimeout(() => {
          setVisibleToasts(prev => prev.filter(tid => tid !== id));
        }, 3000); // Hide after exactly 3 seconds
      });
    }
  }, [notifications]);

  // Scroll to top of window on view transition
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [currentView]);

  // Support native browser Back/Forward navigation popstate sync
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      if (path === '/pkadmin' || path === '/admin' || path === '/admin-login' || path === '/admin/login') {
        setCurrentView('admin-login');
      } else if (path === '/pkadmin/dashboard' || path === '/admin-dashboard' || path === '/admin/dashboard') {
        setCurrentView('admin-dashboard');
      } else if (path === '/products') {
        setCurrentView('products');
      } else if (path === '/cart') {
        setCurrentView('cart');
      } else if (path === '/checkout') {
        setCurrentView('checkout');
      } else if (path === '/auth' || path === '/login' || path === '/signup') {
        setCurrentView('auth');
      } else if (path === '/profile' || path === '/my-account') {
        setCurrentView('profile');
      } else if (path === '/affiliate-portal' || path === '/affiliate') {
        setCurrentView('affiliate-status');
      } else if (path === '/about') {
        setCurrentView('about');
      } else if (path === '/contact') {
        setCurrentView('contact');
      } else if (path === '/privacy') {
        setCurrentView('privacy');
      } else if (path === '/terms') {
        setCurrentView('terms');
      } else if (path === '/refund') {
        setCurrentView('refund');
      } else if (path === '/faq') {
        setCurrentView('faq');
      } else if (path === '/blog') {
        setCurrentView('blog');
      } else if (path.startsWith('/blog/')) {
        const slug = path.split('/')[2];
        if (slug) {
          localStorage.setItem('pak_tajarat_selected_blog_slug', slug);
          setCurrentView('blog-details');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentView]);

  // Click on toast alert to navigate to relevant section
  const handleNotificationClick = (toast: any) => {
    markNotificationRead(toast.id);
    if (
      toast.title.toLowerCase().includes('congratulations') || 
      toast.title.toLowerCase().includes('approved') || 
      toast.message.toLowerCase().includes('affiliate')
    ) {
      setCurrentView('profile');
      setActiveDashboardTab('affiliate');
    }
  };

  // Pick correct View component to render dynamically
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'products':
        return <ProductsView />;
      case 'product-details':
      case 'details':
        return <ProductDetailsView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'auth':
        return <AuthView />;
      case 'profile':
        return <UserDashboardView />;
      case 'admin-dashboard':
        return <AdminDashboardView />;
      case 'admin-login':
        return <AdminLoginView />;
      case 'affiliate-portal':
        return <AffiliatePortalView />;
      case 'about':
        return <AboutView />;
      case 'contact':
        return <ContactView />;
      case 'blog':
        return <BlogView />;
      case 'blog-details':
        return <BlogDetailsView />;
      case 'privacy':
        return <PrivacyView />;
      case 'terms':
        return <TermsView />;
      case 'refund':
        return <RefundView />;
      case 'faq':
        return <FaqView />;
      case 'not-found':
        return <NotFoundView />;
      case 'error':
        return <InternalServerErrorView />;
      default:
        return <NotFoundView />;
    }
  };

  // Get active unread notifications for floating toast banner alerts
  const activeUnreadNotifications = notifications.filter(n => !n.read && visibleToasts.includes(n.id));

  // Separate Admin layout completely from customer website
  if (currentView === 'admin-dashboard' || currentView === 'admin-login') {
    const isAuthorizedAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Worker';
    if (currentView === 'admin-dashboard' && !isAuthorizedAdmin) {
      return (
        <div className="min-h-screen bg-slate-900 dark:bg-zinc-950 text-slate-100 font-sans transition-colors duration-300">
          <React.Suspense fallback={<PageSkeletonLoader />}>
            <AdminLoginView />
          </React.Suspense>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-900 dark:bg-zinc-950 text-slate-100 font-sans transition-colors duration-300">
        <React.Suspense fallback={<PageSkeletonLoader />}>
          {currentView === 'admin-dashboard' ? <AdminDashboardView /> : <AdminLoginView />}
        </React.Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Universal header */}
      <Header />

      {/* Main Viewport Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pt-[142px] md:pt-[118px]">
        <React.Suspense fallback={<PageSkeletonLoader />}>
          {renderCurrentView()}
        </React.Suspense>
      </div>

      {/* Universal footer */}
      <Footer />

      {/* Floating Quick View Modal Overlay */}
      <QuickViewModal />

      {/* Floating AI Customer Support Chatbot */}
      <AiCustomerChatbot />

      {/* Dynamic Floating Toast Alerts Center (Bottom Right Corner) */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-xs sm:max-w-sm w-full pointer-events-none">
        {activeUnreadNotifications.slice(0, 3).map((toast, idx) => (
          <div
            key={toast.id ? `${toast.id}-${idx}` : `toast-${idx}`}
            className="pointer-events-auto bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 shadow-xl flex items-start space-x-3 text-xs animate-in slide-in-from-bottom-5 duration-300"
          >
            <div className={`p-1.5 rounded-xl text-white ${
              toast.type === 'success' ? 'bg-[#0F9D58]' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
            }`}>
              <Bell size={14} />
            </div>
            
            <div 
              className="flex-1 text-left space-y-0.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleNotificationClick(toast)}
            >
              <h4 className="font-extrabold text-gray-900 dark:text-white truncate">{toast.title}</h4>
              <p className="text-gray-500 dark:text-gray-400 leading-normal line-clamp-2">{toast.message}</p>
            </div>

            <button
              onClick={() => markNotificationRead(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: { children: ReactNode }) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ERROR BOUNDARY CATACLYSM]:", error, errorInfo);
  }

  resetError = () => {
    (this as any).setState({ hasError: false, error: null });
  };

  render() {
    const self = this as any;
    if (self.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col font-sans">
          <Header />
          <div className="flex-1 flex items-center justify-center pt-24 pb-12">
            <InternalServerErrorView error={self.state.error || undefined} resetError={this.resetError} />
          </div>
          <Footer />
        </div>
      );
    }
    return self.props.children;
  }
}

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </AppProvider>
  );
}
