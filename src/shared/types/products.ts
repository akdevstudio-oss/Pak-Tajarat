export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in PKR
  originalPrice?: number; // for discount calculations
  image: string;
  images: string[]; // gallery
  category: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  specifications: Record<string, string>;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFlashSale?: boolean;
  affiliateEnabled?: boolean;
  commissionType?: 'fixed' | 'percentage';
  commissionValue?: number;
  minOrderQty?: number;
  maxCommissionLimit?: number;
  affiliateVisibility?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  imageAlt?: string;
  imageTitle?: string;
  imageCaption?: string;
  imageDescription?: string;
  videoUrl?: string;
  status?: 'active' | 'draft' | 'scheduled';
  scheduledPublishDate?: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  date: string;
}

export const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Grocery', 'Mobile Accessories', 'Sports', 'Toys', 'Books'];

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  iconUrl?: string;
  bannerUrl?: string;
  iconAlt?: string;
  bannerAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  order?: number;
  isVisible?: boolean;
}

export interface ProductImageSeo {
  url: string;
  altText?: string;
  title?: string;
  caption?: string;
  description?: string;
  focusKeyword?: string;
  seoFileName?: string;
  ogImage?: string;
  twitterImage?: string;
}
