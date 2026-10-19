/**
 * Updates the document favicon immediately after an admin changes branding.
 * Uses an existing favicon link where possible and creates one when absent.
 */
export function forceUpdateFavicon(url: string): void {
  if (typeof document === 'undefined' || !url) return;
  const normalizedUrl = url.trim();
  if (!normalizedUrl) return;

  let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  link.href = normalizedUrl;
  if (/\.svg(?:[?#].*)?$/i.test(normalizedUrl)) link.type = 'image/svg+xml';
  else if (/\.png(?:[?#].*)?$/i.test(normalizedUrl)) link.type = 'image/png';
  else if (/\.ico(?:[?#].*)?$/i.test(normalizedUrl)) link.type = 'image/x-icon';
  else link.removeAttribute('type');
}

/**
 * Applies the site's editable SEO and branding settings to the document head.
 */
export function applySeoAndBrandingToHead(
  seoConfig: import('../shared/types').SeoConfig,
  brandingConfig: import('../shared/types').SiteBrandingConfig
): void {
  if (typeof document === 'undefined') return;

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const routeSeo: Record<string, { title: string; description: string; robots?: string }> = {
    '/': { title: 'Pak-Tijarat | Pakistan’s Trusted Digital Marketplace', description: 'Shop quality products across Pakistan with Pak-Tijarat. Explore available products, current prices, Cash on Delivery, and customer support.' },
    '/products': { title: 'Shop Products in Pakistan | Pak-Tijarat', description: 'Browse available products at Pak-Tijarat. Check current stock, prices and Cash on Delivery availability across Pakistan.' },
    '/shop': { title: 'Shop Products in Pakistan | Pak-Tijarat', description: 'Browse available products at Pak-Tijarat. Check current stock, prices and Cash on Delivery availability across Pakistan.' },
    '/about': { title: 'About Pak-Tijarat | Pakistan’s Trusted Digital Marketplace', description: 'Learn about Pak-Tijarat, our marketplace mission, seller support and online shopping services for customers across Pakistan.' },
    '/contact': { title: 'Contact Pak-Tijarat | Customer Support', description: 'Contact Pak-Tijarat for order questions, product information, business partnerships and marketplace support.' },
    '/faq': { title: 'FAQs | Pak-Tijarat', description: 'Find answers about ordering, Cash on Delivery, delivery, returns, accounts and selling on Pak-Tijarat.' },
    '/privacy': { title: 'Privacy Policy | Pak-Tijarat', description: 'Read how Pak-Tijarat handles account details, order information and website data.' },
    '/terms': { title: 'Terms and Conditions | Pak-Tijarat', description: 'Review the terms for using Pak-Tijarat and placing marketplace orders.' },
    '/refund': { title: 'Returns and Refunds | Pak-Tijarat', description: 'Review Pak-Tijarat’s return and refund process before placing an order.' },
    '/blog': { title: 'Shopping Guides and News | Pak-Tijarat', description: 'Read shopping guides and marketplace updates from Pak-Tijarat.' },
    '/cart': { title: 'Your Shopping Cart | Pak-Tijarat', description: 'Review items in your Pak-Tijarat shopping cart before checkout.', robots: 'noindex, follow' },
    '/checkout': { title: 'Secure Checkout | Pak-Tijarat', description: 'Confirm your delivery details and place your Pak-Tijarat order with Cash on Delivery.', robots: 'noindex, follow' },
    '/auth': { title: 'Sign In or Register | Pak-Tijarat', description: 'Sign in or create a Pak-Tijarat account to manage orders and your profile.', robots: 'noindex, follow' },
    '/login': { title: 'Sign In | Pak-Tijarat', description: 'Sign in to your Pak-Tijarat account.', robots: 'noindex, follow' },
    '/signup': { title: 'Create an Account | Pak-Tijarat', description: 'Create a Pak-Tijarat account to manage your orders and profile.', robots: 'noindex, follow' },
    '/profile': { title: 'My Account | Pak-Tijarat', description: 'Manage your Pak-Tijarat account and orders.', robots: 'noindex, follow' },
    '/affiliate': { title: 'Affiliate Program | Pak-Tijarat', description: 'Learn about earning commissions by referring customers to Pak-Tijarat.' },
    '/affiliate-portal': { title: 'Affiliate Portal | Pak-Tijarat', description: 'Access your Pak-Tijarat affiliate account and referral information.', robots: 'noindex, follow' }
  };
  const route = routeSeo[pathname];
  const isProductRoute = /^\/products?\/[^/]+$/i.test(pathname);
  const title = route?.title || (isProductRoute ? 'Product Details | Pak-Tijarat' : (seoConfig?.metaTitle || seoConfig?.siteTitle || brandingConfig?.storeName || 'Pak-Tijarat'));
  const description = route?.description || (isProductRoute ? 'View product details, current price, stock and ordering information on Pak-Tijarat.' : seoConfig?.metaDescription);
  document.title = title;

  const setMeta = (selector: string, attribute: 'name' | 'property', key: string, value?: string) => {
    if (!value?.trim()) return;
    let element = document.head.querySelector<HTMLMetaElement>(selector);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, key);
      document.head.appendChild(element);
    }
    element.content = value.trim();
  };

  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[name="keywords"]', 'name', 'keywords', seoConfig?.keywords);
  setMeta('meta[name="robots"]', 'name', 'robots', route?.robots || seoConfig?.robotsSettings);
  setMeta('meta[property="og:title"]', 'property', 'og:title', seoConfig?.ogTitle || title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', route?.description || seoConfig?.ogDescription || description);
  setMeta('meta[property="og:type"]', 'property', 'og:type', seoConfig?.ogType || 'website');
  const configuredShareImage = seoConfig?.ogImage || brandingConfig?.ogImageUrl || brandingConfig?.defaultSeoImageUrl;
  const brandedShareImage = 'https://pak-tajarat.store/android-chrome-512x512.png';
  const shareImage = configuredShareImage && !/images\\.unsplash\\.com/i.test(configuredShareImage) ? configuredShareImage : brandedShareImage;
  setMeta('meta[property="og:image"]', 'property', 'og:image', shareImage);
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', seoConfig?.twitterCard || 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', seoConfig?.ogTitle || title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', route?.description || seoConfig?.ogDescription || description);
  const configuredTwitterImage = seoConfig?.twitterImage || configuredShareImage;
  const twitterImage = configuredTwitterImage && !/images\\.unsplash\\.com/i.test(configuredTwitterImage) ? configuredTwitterImage : brandedShareImage;
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', twitterImage);

  // Canonicals must follow the active SPA route, not remain stuck on the homepage.
  // Use one production host to avoid duplicate www/non-www URLs.
  const configuredCanonical = seoConfig?.canonicalUrl?.trim();
  let canonicalUrl = 'https://pak-tajarat.store' + pathname;
  if (configuredCanonical) {
    try {
      const configured = new URL(configuredCanonical);
      const configuredPath = configured.pathname.replace(/\/+$/, '') || '/';
      if (configuredPath === pathname) canonicalUrl = configured.toString();
    } catch { /* fall back to the normalized route URL */ }
  }
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);

  if (brandingConfig?.faviconUrl) forceUpdateFavicon(brandingConfig.faviconUrl);
}
