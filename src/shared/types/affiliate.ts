export interface Affiliate {
  id: string;
  userId: string;
  referralCode: string;
  totalClicks: number;
  totalReferrals: number;
  totalEarnings: number;
  pendingCommission: number;
  paidCommission: number;
  status: 'active' | 'inactive' | 'pending_approval' | 'rejected';
  paymentMethod?: string;
  paymentDetails?: string;
  createdAt: string;
  rejectionReason?: string;
  isTopSeller?: boolean;
  activated?: boolean;
}

export interface ReferralTransaction {
  id: string;
  affiliateId: string;
  referredUserId: string;
  orderId?: string;
  purchaseAmount?: number;
  commissionAmount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cooling';
  date: string;
  type: 'click' | 'conversion';
  deliveryDate?: string;
}

export interface WithdrawalRequest {
  id: string;
  affiliateId: string;
  amount: number;
  paymentMethod: string;
  paymentDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface AffiliateApplication {
  id?: string;
  uid: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  country: string;
  address?: string;
  previousAffiliateExperience: boolean;
  previousAffiliatePrograms: string;
  promotionMethods: string[];
  otherPromotionMethod: string;
  reasonForJoining: string;
  estimatedMonthlySales: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    website: string;
    linkedin: string;
  };
  website?: string;
  experience?: string;
  acceptedTerms: boolean;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  affiliateActivated: boolean;
  emailVerified: boolean;
  adminNotes: string;
  submittedAt: string;
}

export interface EnterpriseAffiliate {
  id: string;
  userId: string;
  referralCode: string;
  fullName: string;
  email: string;
  phone: string;
  photoUrl?: string;
  status: 'active' | 'inactive' | 'pending_approval' | 'suspended';
  totalClicks: number;
  uniqueClicks: number;
  totalOrders: number;
  conversionRate: number;
  totalEarnings: number;
  pendingCommission: number;
  approvedCommission: number;
  paidCommission: number;
  paymentMethod?: string;
  paymentDetails?: string;
  bankDetails?: { bankName: string; accountNumber: string; accountTitle: string; iban?: string };
  mobileWallet?: { provider: 'JazzCash' | 'EasyPaisa' | 'NayaPay'; number: string; title: string };
  createdAt: string;
  isTopSeller?: boolean;
  notes?: string;
}

export interface AffiliateReferralLink {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  title: string;
  targetType: 'homepage' | 'product' | 'category' | 'brand' | 'campaign';
  targetUrl: string;
  destinationUrl: string;
  shortUrl: string;
  qrCodeDataUrl?: string;
  clicks: number;
  uniqueClicks: number;
  ordersCount: number;
  revenueGenerated: number;
  commissionEarned: number;
  createdAt: string;
}

export interface AffiliateCommissionRule {
  id: string;
  ruleName: string;
  type: 'percentage' | 'fixed';
  value: number;
  appliesTo: 'global' | 'product' | 'category' | 'brand' | 'campaign';
  targetId?: string;
  seasonalBonusPercent?: number;
  status: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
}

export interface AffiliateCommissionRecord {
  id: string;
  affiliateId: string;
  affiliateName: string;
  orderId: string;
  customerName: string;
  productName: string;
  quantity: number;
  orderAmount: number;
  commissionType: 'percentage' | 'fixed' | 'bonus' | 'manual';
  commissionRate: number;
  commissionAmount: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'Cancelled';
  date: string;
  refundStatus?: 'None' | 'Requested' | 'Refunded';
  notes?: string;
}

export interface AffiliatePayoutRequest {
  id: string;
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'JazzCash' | 'EasyPaisa' | 'NayaPay';
  accountTitle: string;
  accountNumber: string;
  transactionId?: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Paid' | 'Rejected';
  requestDate: string;
  processedDate?: string;
  adminNotes?: string;
}

export interface AffiliatePaymentHistoryItem {
  id: string;
  payoutRequestId: string;
  affiliateId: string;
  affiliateName: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  status: 'Completed' | 'Refunded' | 'Failed';
  receiptUrl?: string;
}

export interface AffiliateCouponItem {
  id: string;
  code: string;
  affiliateId: string;
  affiliateName: string;
  type: 'Affiliate' | 'Discount' | 'Referral' | 'Campaign';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  usageCount: number;
  totalOrders: number;
  revenueGenerated: number;
  createdAt: string;
  status: 'Active' | 'Expired' | 'Disabled';
}

export interface AffiliateMarketingAsset {
  id: string;
  title: string;
  category: 'Banner' | 'Logo' | 'Product Image' | 'Video' | 'Social Post' | 'Email Template' | 'WhatsApp Template';
  fileUrl?: string;
  contentSnippet?: string;
  dimensions?: string;
  downloadsCount: number;
  uploadedAt: string;
}

export interface AffiliateFraudAlert {
  id: string;
  affiliateId: string;
  affiliateName: string;
  type: 'Self Referral' | 'Fake Orders' | 'Duplicate Accounts' | 'Multiple Accounts' | 'VPN Abuse' | 'Bot Clicks' | 'Spam Clicks' | 'High Refund Ratio';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  ipAddress?: string;
  status: 'Flagged' | 'Investigating' | 'Resolved' | 'Action Taken';
  detectedAt: string;
}

export interface AffiliateSettingsConfig {
  enabled: boolean;
  approvalType: 'Auto' | 'Manual';
  minWithdrawalAmount: number;
  commissionHoldPeriodDays: number;
  cookieDurationDays: number;
  defaultCommissionRate: number;
  maxCommissionCap: number;
  paymentMethodsAllowed: string[];
  currency: string;
  taxRatePercentage: number;
  termsRequired: boolean;
}

export interface AffiliateTermsConfig {
  content: string;
  version: string;
  lastUpdated: string;
  isPublished: boolean;
}

export interface AffiliateActivityLog {
  id: string;
  affiliateId?: string;
  actorName: string;
  actorRole: 'Admin' | 'Affiliate' | 'System';
  actionType: 'Login' | 'Logout' | 'Commission Changed' | 'Withdrawal Action' | 'Status Changed' | 'Fraud Event' | 'Asset Created' | 'Settings Updated';
  description: string;
  ipAddress?: string;
  timestamp: string;
}
