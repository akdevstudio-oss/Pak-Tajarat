export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  date: string;
}

export type ActiveView = 
  | 'home' 
  | 'products' 
  | 'details' 
  | 'product-details'
  | 'cart' 
  | 'checkout' 
  | 'contact' 
  | 'about' 
  | 'auth' 
  | 'profile' 
  | 'admin-dashboard'
  | 'admin-login'
  | 'affiliate-status'
  | 'affiliate-portal'
  | 'blog'
  | 'blog-details'
  | 'privacy'
  | 'terms'
  | 'refund'
  | 'faq'
  | 'not-found'
  | 'error';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  author: string;
  authorTitle?: string;
  authorAvatar?: string;
  date: string;
  readTime: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isPublished: boolean;
  language: 'en' | 'ur' | 'roman' | 'both';
  coverImageAlt?: string;
  coverImageCaption?: string;
  status?: 'Published' | 'Draft' | 'Scheduled';
  scheduledDate?: string;
  isFeatured?: boolean;
  focusKeyword?: string;
  canonicalUrl?: string;
}

export interface BlogComment {
  id: string;
  postId: string;
  userName: string;
  userEmail?: string;
  comment: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Spam';
}
