import type { ActiveView } from '../shared/types';

/**
 * Resolves the initial single-page-app view from the current browser URL.
 * The app uses local state for navigation, so this function keeps direct links
 * and refreshes consistent with the route handling in App.tsx.
 */
export function getInitialRoute(): { view: ActiveView; productId: string | null } {
  if (typeof window === 'undefined') return { view: 'home', productId: null };

  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('pid') || params.get('product') || null;

  if (path === '/pkadmin' || path === '/admin' || path === '/admin-login' || path === '/admin/login') {
    return { view: 'admin-login', productId: null };
  }
  if (path === '/pkadmin/dashboard' || path === '/admin-dashboard' || path === '/admin/dashboard') {
    return { view: 'admin-dashboard', productId: null };
  }
  if (path === '/products' || path === '/shop') return { view: 'products', productId: null };
  if (path === '/cart') return { view: 'cart', productId: null };
  if (path === '/checkout') return { view: 'checkout', productId: null };
  if (path === '/auth' || path === '/login' || path === '/signup') return { view: 'auth', productId: null };
  if (path === '/profile' || path === '/my-account') return { view: 'profile', productId: null };
  if (path === '/affiliate-portal' || path === '/affiliate') return { view: 'affiliate-status', productId: null };
  if (path === '/about') return { view: 'about', productId: null };
  if (path === '/contact') return { view: 'contact', productId: null };
  if (path === '/privacy') return { view: 'privacy', productId: null };
  if (path === '/terms') return { view: 'terms', productId: null };
  if (path === '/refund') return { view: 'refund', productId: null };
  if (path === '/faq') return { view: 'faq', productId: null };
  if (path === '/blog') return { view: 'blog', productId: null };
  if (path.startsWith('/blog/')) {
    const slug = path.split('/')[2];
    if (slug) {
      try { localStorage.setItem('pak_tajarat_selected_blog_slug', slug); } catch { /* storage may be disabled */ }
      return { view: 'blog-details', productId: null };
    }
  }
  if (path.startsWith('/product/') || path.startsWith('/products/')) {
    const id = path.split('/')[2] || productId;
    return { view: 'product-details', productId: id };
  }
  if (productId) return { view: 'product-details', productId };
  return { view: 'home', productId: null };
}
