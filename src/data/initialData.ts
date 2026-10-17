import { Product, Coupon, BlogPost, SiteBrandingConfig, CategoryItem, SeoConfig, HeroBanner } from '../types';

export const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Grocery',
  'Mobile Accessories',
  'Sports',
  'Toys',
  'Books'
];

export const DEFAULT_BRANDING_CONFIG: SiteBrandingConfig = {
  primaryColor: '#059669',
  accentColor: '#10B981',
  storeName: 'PAK-TAJARAT',
  slogan: "Pakistan's Premier Digital Marketplace & B2B Hub",
  contactPhone: '0326-1604808',
  contactEmail: 'support@paktajarat.pk',
  address: 'Plot 42, Sector I-9/2, Industrial Area, Islamabad, Pakistan'
};

export const DEFAULT_SITE_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Electronics', icon: 'Cpu', slug: 'electronics' },
  { id: 'cat-2', name: 'Fashion', icon: 'Shirt', slug: 'fashion' },
  { id: 'cat-3', name: 'Home & Kitchen', icon: 'Home', slug: 'home-kitchen' },
  { id: 'cat-4', name: 'Beauty', icon: 'Sparkles', slug: 'beauty' },
  { id: 'cat-5', name: 'Grocery', icon: 'ShoppingBag', slug: 'grocery' },
  { id: 'cat-6', name: 'Mobile Accessories', icon: 'Smartphone', slug: 'mobile-accessories' },
  { id: 'cat-7', name: 'Sports', icon: 'Activity', slug: 'sports' },
  { id: 'cat-8', name: 'Toys', icon: 'Gamepad2', slug: 'toys' },
  { id: 'cat-9', name: 'Books', icon: 'BookOpen', slug: 'books' }
];

export const DEFAULT_SEO_CONFIG: SeoConfig = {
  siteTitle: 'Pak-Tajarat | Pakistan\'s Premier Digital Marketplace',
  metaDescription: 'Shop top quality products across Pakistan with fast COD delivery and 100% buyer protection.',
  keywords: 'e-commerce, pakistan shopping, online store, pak-tajarat, buy online pakistan',
  ogImage: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1200&q=80',
  twitterHandle: '@PakTajarat'
};

export const DEFAULT_HERO_BANNERS: HeroBanner[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_COUPONS: Coupon[] = [];

export const INITIAL_REVIEWS = [];

export const INITIAL_BLOGS: BlogPost[] = [];
