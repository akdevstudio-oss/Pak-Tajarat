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

  const title = seoConfig?.metaTitle || seoConfig?.siteTitle || brandingConfig?.storeName || 'Pak-Tijarat';
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

  setMeta('meta[name="description"]', 'name', 'description', seoConfig?.metaDescription);
  setMeta('meta[name="keywords"]', 'name', 'keywords', seoConfig?.keywords);
  setMeta('meta[name="robots"]', 'name', 'robots', seoConfig?.robotsSettings);
  setMeta('meta[property="og:title"]', 'property', 'og:title', seoConfig?.ogTitle || title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', seoConfig?.ogDescription || seoConfig?.metaDescription);
  setMeta('meta[property="og:type"]', 'property', 'og:type', seoConfig?.ogType || 'website');
  setMeta('meta[property="og:image"]', 'property', 'og:image', seoConfig?.ogImage || brandingConfig?.ogImageUrl || brandingConfig?.defaultSeoImageUrl);
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', seoConfig?.twitterCard || 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', seoConfig?.ogTitle || title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', seoConfig?.ogDescription || seoConfig?.metaDescription);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', seoConfig?.twitterImage || brandingConfig?.ogImageUrl || brandingConfig?.defaultSeoImageUrl);

  // Canonicals must follow the active SPA route, not remain stuck on the homepage.
  // Use one production host to avoid duplicate www/non-www URLs.
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
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

  if (brandingConfig?.faviconUrl) forceUpdateFavicon(brandingConfig.faviconUrl);
}
