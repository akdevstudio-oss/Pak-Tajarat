export interface LogoConfig {
  sizePreset: 'small' | 'medium' | 'large' | 'custom';
  sizeScale: number;
  showText: boolean;
  variant: 'full' | 'icon' | 'default';
  customText: string;
  customSizeInPixels?: number;
  logoType?: 'vector' | 'image';
  logoImageUrl?: string;
  faviconUrl?: string;
  appIconUrl?: string;
  ogImageUrl?: string;
  defaultSeoImageUrl?: string;
}

export interface SiteBrandingConfig {
  logoImageUrl?: string;
  faviconUrl?: string;
  appIconUrl?: string;
  ogImageUrl?: string;
  defaultSeoImageUrl?: string;
  logoType?: 'vector' | 'image';
  showText?: boolean;
  customText?: string;
  brandTagline?: string;
  primaryColor?: string;
  accentColor?: string;
  storeName?: string;
  slogan?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  gradient?: string;
  image?: string; // Desktop Image
  imageUrl?: string;
  mobileImage?: string;
  badge?: string;
  badgeText?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  textColor?: string;
  buttonColor?: string;
  imageAlt?: string;
  imageTitle?: string;
  imageCaption?: string;
  seoKeywords?: string;
  isEnabled?: boolean;
  order?: number;
  startDate?: string;
  endDate?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  path?: string; // Cloudflare R2 object key used for storage cleanup
  folder: string; // 'Branding' | 'Banners' | 'Categories' | 'Products' | 'Blog' | 'General'
  size?: number; // bytes
  type?: string; // mime type
  altText?: string;
  title?: string;
  caption?: string;
  description?: string;
  focusKeyword?: string;
  tags?: string[];
  uploadedAt: string;
}

export interface SeoConfig {
  siteTitle?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  robotsSettings?: string; // 'index, follow' | 'noindex, nofollow'
  sitemapEnabled?: boolean;
  sitemapFrequency?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  twitterImage?: string;
  twitterHandle?: string;
}
