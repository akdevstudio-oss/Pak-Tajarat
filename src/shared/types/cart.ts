import { Product } from './products';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  type?: 'percentage' | 'fixed';
  discount?: number;
  expiryDate?: string;
  minSpend?: number;
  isReward?: boolean;
  assignedTo?: string; // affiliateId or affiliate referral code
  eligibility?: string; // e.g. "Top Seller of the Month", "Over 10 Sales Referred"
}
