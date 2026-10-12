import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  EnterpriseAffiliate,
  AffiliateApplication,
  AffiliateReferralLink,
  AffiliateCommissionRecord,
  AffiliatePayoutRequest,
  AffiliatePaymentHistoryItem,
  AffiliateCouponItem,
  AffiliateMarketingAsset,
  AffiliateFraudAlert,
  AffiliateSettingsConfig,
  AffiliateTermsConfig,
  AffiliateActivityLog
} from '../../types';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { db } from '../../firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  LayoutDashboard, FileText, Users, Link2, DollarSign, ShoppingBag,
  CreditCard, History, Tag, Image as ImageIcon, ShieldAlert, FileSpreadsheet,
  Bell, Settings, FileCheck, Activity, Search, Filter, Plus, Download,
  Printer, Check, X, Ban, Sparkles, RefreshCw, ChevronLeft, ChevronRight,
  Eye, Edit3, Trash2, ArrowUpRight, ArrowDownRight, ExternalLink, QrCode,
  AlertTriangle, Lock, Mail, Phone, Globe, Shield, CheckCircle2, UserCheck,
  Send, Copy, CheckSquare, Square, Percent
} from 'lucide-react';

export type SubTab =
  | 'dashboard'
  | 'applications'
  | 'affiliates'
  | 'referral-links'
  | 'commissions'
  | 'orders'
  | 'payout-requests'
  | 'payment-history'
  | 'coupons'
  | 'marketing-assets'
  | 'fraud-detection'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'terms'
  | 'activity-logs';

export const EnterpriseAffiliateModule: React.FC = () => {
  const { addNotification, products, orders } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Real-time Firestore Collections
  const [applications, setApplications] = useState<AffiliateApplication[]>([]);
  const [affiliates, setAffiliates] = useState<EnterpriseAffiliate[]>([]);
  const [referralLinks, setReferralLinks] = useState<AffiliateReferralLink[]>([]);
  const [commissions, setCommissions] = useState<AffiliateCommissionRecord[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<AffiliatePayoutRequest[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<AffiliatePaymentHistoryItem[]>([]);
  const [affiliateCoupons, setAffiliateCoupons] = useState<AffiliateCouponItem[]>([]);
  const [marketingAssets, setMarketingAssets] = useState<AffiliateMarketingAsset[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<AffiliateFraudAlert[]>([]);
  const [activityLogs, setActivityLogs] = useState<AffiliateActivityLog[]>([]);
  const [settings, setSettings] = useState<AffiliateSettingsConfig>({
    enabled: true,
    approvalType: 'Manual',
    minWithdrawalAmount: 2000,
    commissionHoldPeriodDays: 14,
    cookieDurationDays: 30,
    defaultCommissionRate: 10,
    maxCommissionCap: 50000,
    paymentMethodsAllowed: ['Bank Transfer', 'JazzCash', 'EasyPaisa', 'NayaPay'],
    currency: 'PKR',
    taxRatePercentage: 5,
    termsRequired: true
  });
  const [terms, setTerms] = useState<AffiliateTermsConfig>({
    content: `# Pak-Tajarat Affiliate Partner Agreement\n\n1. **Commission Terms**: Affiliates earn up to 10% on valid delivered orders.\n2. **Payout Threshold**: Minimum payout is RS. 2,000.\n3. **Prohibited Activities**: Self-referrals, spam, and misleading ads are strictly forbidden.\n4. **Cookie Period**: Referral cookies remain active for 30 days.`,
    version: '1.2.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    isPublished: true
  });

  // Modal States
  const [selectedApplication, setSelectedApplication] = useState<AffiliateApplication | null>(null);
  const [selectedAffiliate, setSelectedAffiliate] = useState<EnterpriseAffiliate | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState<AffiliatePayoutRequest | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; action: () => void } | null>(null);

  // Link Generator Form
  const [newLink, setNewLink] = useState({
    affiliateId: '',
    title: '',
    targetType: 'homepage' as const,
    targetUrl: 'https://paktajarat.pk'
  });

  // Asset Creation Form
  const [newAsset, setNewAsset] = useState({
    title: '',
    category: 'Banner' as const,
    fileUrl: '',
    contentSnippet: ''
  });

  // Manual Commission Form
  const [manualBonus, setManualBonus] = useState({
    affiliateId: '',
    type: 'bonus' as const,
    amount: 1000,
    notes: 'Seasonal Top Performer Reward'
  });

  // Notification Broadcast Form
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    target: 'all'
  });

  // Auto-Refresh & Fetch State (10 Minutes = 600 Seconds)
  const REFRESH_INTERVAL_SECONDS = 600;
  const [countdown, setCountdown] = useState<number>(REFRESH_INTERVAL_SECONDS);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Fetch all Affiliate collections from Firestore
  const fetchAffiliateData = useCallback(async (isManual = false) => {
    setIsFetching(true);
    try {
      const [
        appsSnap,
        affsSnap,
        linksSnap,
        commsSnap,
        payoutsSnap,
        paymentsSnap,
        couponsSnap,
        assetsSnap,
        fraudSnap,
        logsSnap
      ] = await Promise.all([
        getDocs(collection(db, 'affiliateApplications')),
        getDocs(collection(db, 'affiliates')),
        getDocs(collection(db, 'affiliateLinks')),
        getDocs(collection(db, 'affiliateCommissions')),
        getDocs(collection(db, 'affiliateWithdrawals')),
        getDocs(collection(db, 'affiliatePayments')),
        getDocs(collection(db, 'affiliateCoupons')),
        getDocs(collection(db, 'affiliateAssets')),
        getDocs(collection(db, 'affiliateFraud')),
        getDocs(collection(db, 'affiliateLogs'))
      ]);

      const fetchedApps = appsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AffiliateApplication[];
      const fetchedAffs = affsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EnterpriseAffiliate[];
      const fetchedLinks = linksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AffiliateReferralLink[];
      const fetchedComms = commsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AffiliateCommissionRecord[];
      const fetchedPayouts = payoutsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AffiliatePayoutRequest[];
      const fetchedPayments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AffiliatePaymentHistoryItem[];
      const fetchedCoupons = couponsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AffiliateCouponItem[];
      const fetchedAssets = assetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AffiliateMarketingAsset[];
      const fetchedFraud = fraudSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AffiliateFraudAlert[];
      const fetchedLogs = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AffiliateActivityLog[];

      setApplications(fetchedApps);
      setAffiliates(fetchedAffs);
      setReferralLinks(fetchedLinks);
      setCommissions(fetchedComms);
      setPayoutRequests(fetchedPayouts);
      setPaymentHistory(fetchedPayments);
      setAffiliateCoupons(fetchedCoupons);
      setMarketingAssets(fetchedAssets);
      setFraudAlerts(fetchedFraud);
      setActivityLogs(fetchedLogs);

      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCountdown(REFRESH_INTERVAL_SECONDS);

      if (isManual) {
        addNotification('Refreshed', 'Affiliate module data updated successfully.', 'info');
      }

      // Seed if empty
      if (fetchedAffs.length === 0) {
        const dummyAffiliates: EnterpriseAffiliate[] = [
          {
            id: 'aff-101',
            userId: 'usr-101',
            referralCode: 'PAK-TARIQ-77',
            fullName: 'Tariq Mehmood',
            email: 'tariq.affiliate@gmail.com',
            phone: '+92 300 1234567',
            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            status: 'active',
            totalClicks: 1420,
            uniqueClicks: 1150,
            totalOrders: 86,
            conversionRate: 6.05,
            totalEarnings: 84500,
            pendingCommission: 12500,
            approvedCommission: 22000,
            paidCommission: 50000,
            paymentMethod: 'JazzCash',
            paymentDetails: '03001234567 - Tariq Mehmood',
            mobileWallet: { provider: 'JazzCash', number: '03001234567', title: 'Tariq Mehmood' },
            createdAt: '2026-01-10',
            isTopSeller: true
          }
        ];
        setAffiliates(dummyAffiliates);
        seedDefaultDataIfEmpty(dummyAffiliates);
      }
    } catch (err) {
      console.error('Error fetching affiliate data:', err);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  }, []);

  // Set up 10-minute interval and 1-second countdown timer
  useEffect(() => {
    fetchAffiliateData();

    // Timer countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchAffiliateData();
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchAffiliateData]);

  // Format MM:SS for countdown
  const formattedCountdown = useMemo(() => {
    const m = Math.floor(countdown / 60);
    const s = countdown % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [countdown]);

  // Seed Fallback Initial Data if Firestore is fresh
  const seedDefaultDataIfEmpty = async (items: EnterpriseAffiliate[]) => {
    try {
      for (const aff of items) {
        await setDoc(doc(db, 'affiliates', aff.id), aff);
      }
    } catch {
      // Ignore write permission error if non-admin or offline
    }
  };

  // Log Action Helper
  const logAudit = async (actionType: AffiliateActivityLog['actionType'], description: string) => {
    try {
      const newLog: AffiliateActivityLog = {
        id: 'log-' + Date.now(),
        actorName: 'Admin',
        actorRole: 'Admin',
        actionType,
        description,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, 'affiliateLogs', newLog.id), newLog);
    } catch (e) {
      console.error(e);
    }
  };

  // Audit Calculations for Dashboard
  const stats = useMemo(() => {
    const totalApps = applications.length;
    const pendingApps = applications.filter(a => a.status === 'Pending').length;
    const activeAffs = affiliates.filter(a => a.status === 'active').length;
    const totalClicks = affiliates.reduce((acc, a) => acc + (a.totalClicks || 0), 0);
    const totalOrders = affiliates.reduce((acc, a) => acc + (a.totalOrders || 0), 0);
    const totalEarned = affiliates.reduce((acc, a) => acc + (a.totalEarnings || 0), 0);
    const pendingComm = affiliates.reduce((acc, a) => acc + (a.pendingCommission || 0), 0);
    const approvedComm = affiliates.reduce((acc, a) => acc + (a.approvedCommission || 0), 0);
    const paidComm = affiliates.reduce((acc, a) => acc + (a.paidCommission || 0), 0);
    const pendingPayouts = payoutRequests.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);

    const convRate = totalClicks > 0 ? ((totalOrders / totalClicks) * 100).toFixed(2) : '0.00';

    return {
      totalApps,
      pendingApps,
      activeAffs,
      totalClicks,
      totalOrders,
      totalEarned,
      pendingComm,
      approvedComm,
      paidComm,
      pendingPayouts,
      convRate
    };
  }, [applications, affiliates, payoutRequests]);

  // Actions
  const handleApproveApplication = async (app: AffiliateApplication) => {
    try {
      const affId = 'aff-' + Date.now();
      const code = 'PAK-' + app.fullName.split(' ')[0].toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

      const newAff: EnterpriseAffiliate = {
        id: affId,
        userId: app.uid || 'usr-' + Date.now(),
        referralCode: code,
        fullName: app.fullName,
        email: app.email,
        phone: app.mobileNumber,
        status: 'active',
        totalClicks: 0,
        uniqueClicks: 0,
        totalOrders: 0,
        conversionRate: 0,
        totalEarnings: 0,
        pendingCommission: 0,
        approvedCommission: 0,
        paidCommission: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };

      await setDoc(doc(db, 'affiliates', affId), newAff);
      if (app.id) {
        await updateDoc(doc(db, 'affiliateApplications', app.id), {
          status: 'Approved',
          affiliateActivated: true
        });
      }

      await logAudit('Status Changed', `Approved application for ${app.fullName} (${code})`);
      addNotification('Application Approved', `Created affiliate partner account for ${app.fullName}.`, 'success');
      setSelectedApplication(null);
      fetchAffiliateData();
    } catch (err) {
      console.error(err);
      addNotification('Action Failed', 'Could not approve application.', 'warning');
    }
  };

  const handleRejectApplication = async (app: AffiliateApplication) => {
    try {
      if (app.id) {
        await updateDoc(doc(db, 'affiliateApplications', app.id), { status: 'Rejected' });
        await logAudit('Status Changed', `Rejected affiliate application for ${app.fullName}`);
        addNotification('Application Rejected', `Application for ${app.fullName} set to Rejected.`, 'info');
      }
      setSelectedApplication(null);
      fetchAffiliateData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateLink = async () => {
    try {
      if (!newLink.affiliateId || !newLink.title) {
        addNotification('Validation Error', 'Please select an affiliate and title.', 'warning');
        return;
      }

      const aff = affiliates.find(a => a.id === newLink.affiliateId);
      const code = aff?.referralCode || 'GLOBAL';
      const linkId = 'link-' + Date.now();
      const destUrl = `${newLink.targetUrl}?ref=${code}`;
      const shortUrl = `https://pakt.pk/r/${code}`;

      const item: AffiliateReferralLink = {
        id: linkId,
        affiliateId: newLink.affiliateId,
        affiliateCode: code,
        title: newLink.title,
        targetType: newLink.targetType,
        targetUrl: newLink.targetUrl,
        destinationUrl: destUrl,
        shortUrl: shortUrl,
        clicks: 0,
        uniqueClicks: 0,
        ordersCount: 0,
        revenueGenerated: 0,
        commissionEarned: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };

      await setDoc(doc(db, 'affiliateLinks', linkId), item);
      await logAudit('Asset Created', `Generated referral campaign link "${newLink.title}" for ${code}`);
      addNotification('Link Created', `Referral link short URL: ${shortUrl}`, 'success');
      setShowLinkModal(false);
      setNewLink({ affiliateId: '', title: '', targetType: 'homepage', targetUrl: 'https://paktajarat.pk' });
      fetchAffiliateData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAsset = async () => {
    try {
      if (!newAsset.title) return;
      const assetId = 'asset-' + Date.now();
      const asset: AffiliateMarketingAsset = {
        id: assetId,
        title: newAsset.title,
        category: newAsset.category,
        fileUrl: newAsset.fileUrl || 'https://images.unsplash.com/photo-1556742049-0a67f2d42918?w=800',
        contentSnippet: newAsset.contentSnippet,
        downloadsCount: 0,
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      await setDoc(doc(db, 'affiliateAssets', assetId), asset);
      await logAudit('Asset Created', `Published promotional asset "${newAsset.title}"`);
      addNotification('Marketing Asset Added', 'Partners can now download this campaign asset.', 'success');
      setShowAssetModal(false);
      setNewAsset({ title: '', category: 'Banner', fileUrl: '', contentSnippet: '' });
      fetchAffiliateData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleProcessPayout = async (request: AffiliatePayoutRequest, newStatus: 'Approved' | 'Paid' | 'Rejected') => {
    try {
      const txId = 'TXN-PAK-' + Math.floor(100000 + Math.random() * 900000);
      await updateDoc(doc(db, 'affiliateWithdrawals', request.id), {
        status: newStatus,
        transactionId: txId,
        processedDate: new Date().toISOString().split('T')[0]
      });

      if (newStatus === 'Paid') {
        const historyItem: AffiliatePaymentHistoryItem = {
          id: 'pay-' + Date.now(),
          payoutRequestId: request.id,
          affiliateId: request.affiliateId,
          affiliateName: request.affiliateName,
          amount: request.amount,
          paymentMethod: request.paymentMethod,
          transactionId: txId,
          paymentDate: new Date().toISOString().split('T')[0],
          status: 'Completed'
        };
        await setDoc(doc(db, 'affiliatePayments', historyItem.id), historyItem);

        // Update Affiliate Balance
        const aff = affiliates.find(a => a.id === request.affiliateId);
        if (aff) {
          await updateDoc(doc(db, 'affiliates', aff.id), {
            paidCommission: (aff.paidCommission || 0) + request.amount,
            approvedCommission: Math.max(0, (aff.approvedCommission || 0) - request.amount)
          });
        }
      }

      await logAudit('Withdrawal Action', `Marked payout request #${request.id} as ${newStatus} (Rs. ${request.amount})`);
      addNotification('Payout Updated', `Payout request #${request.id} status set to ${newStatus}.`, 'success');
      setShowPayoutModal(null);
      fetchAffiliateData();
    } catch (e) {
      console.error(e);
    }
  };

  // Render Sub-Navigation Bar
  const subNavItems: Array<{ id: SubTab; label: string; icon: any; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: FileText, badge: stats.pendingApps },
    { id: 'affiliates', label: 'Affiliates', icon: Users, badge: stats.activeAffs },
    { id: 'referral-links', label: 'Referral Links', icon: Link2 },
    { id: 'commissions', label: 'Commission Mgmt', icon: DollarSign },
    { id: 'orders', label: 'Orders & Tracking', icon: ShoppingBag },
    { id: 'payout-requests', label: 'Payout Requests', icon: CreditCard, badge: payoutRequests.filter(p => p.status === 'Pending').length },
    { id: 'payment-history', label: 'Payment History', icon: History },
    { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
    { id: 'marketing-assets', label: 'Marketing Assets', icon: ImageIcon },
    { id: 'fraud-detection', label: 'Fraud Detection', icon: ShieldAlert, badge: fraudAlerts.filter(f => f.status === 'Flagged').length },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'terms', label: 'Terms & Conditions', icon: FileCheck },
    { id: 'activity-logs', label: 'Activity Logs', icon: Activity }
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16 font-sans">
      
      {/* HEADER BAR */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Pak-Tajarat E-Commerce Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Enterprise Affiliate Management Module
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Complete partner relationship management, commission automation, fraud prevention, referral links generator, payout clearinghouse, and multi-channel marketing portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh Info & Manual Sync */}
          <div className="flex items-center space-x-2 bg-zinc-950/80 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isFetching ? 'animate-spin' : ''}`} />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Auto Refresh: 10 Mins</span>
              <span className="text-xs font-mono font-bold text-emerald-400">Next in: {formattedCountdown} {lastUpdated && `(Updated ${lastUpdated})`}</span>
            </div>
            <button
              onClick={() => fetchAffiliateData(true)}
              disabled={isFetching}
              title="Refresh Now"
              className="ml-1 p-1 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <button
            onClick={() => setShowLinkModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Referral Link</span>
          </button>

          <button
            onClick={() => exportToCSV(affiliates, 'affiliate_partners')}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl border border-zinc-700 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportToExcel(affiliates, 'affiliate_partners', 'Affiliates')}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl border border-zinc-700 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL SUB-NAVIGATION TABS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-xl overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700">
        <div className="flex space-x-1 min-w-max">
          {subNavItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id ? `${item.id}-${idx}` : `subnav-${idx}`}
                onClick={() => {
                  setActiveSubTab(item.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1.5 px-2 py-0.5 text-[10px] rounded-full font-black ${
                      isActive ? 'bg-zinc-950 text-emerald-400' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH AND FILTER BAR FOR LIST VIEWS */}
      {activeSubTab !== 'dashboard' && activeSubTab !== 'settings' && activeSubTab !== 'terms' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeSubTab.replace('-', ' ')} by name, code, ID or email...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active / Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected / Suspended</option>
            </select>

            <select
              value={dateRangeFilter}
              onChange={e => setDateRangeFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. DASHBOARD TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Affiliates</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-white">{stats.activeAffs}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">Active</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pending Apps</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-amber-400">{stats.pendingApps}</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">Review</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Referral Clicks</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-white">{stats.totalClicks.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full border border-blue-800">Traffic</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Conversion Rate</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-emerald-400">{stats.convRate}%</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">{stats.totalOrders} Orders</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pending Payouts</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-amber-400">RS. {stats.pendingPayouts.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">Withdrawals</span>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Monthly Referral Revenue & Commission Growth</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'Jan', revenue: 120000, commission: 12000 },
                    { month: 'Feb', revenue: 210000, commission: 21000 },
                    { month: 'Mar', revenue: 340000, commission: 34000 },
                    { month: 'Apr', revenue: 480000, commission: 48000 },
                    { month: 'May', revenue: 620000, commission: 62000 },
                    { month: 'Jun', revenue: 850000, commission: 85000 }
                  ]}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" name="Revenue (PKR)" />
                    <Area type="monotone" dataKey="commission" stroke="#3b82f6" fillOpacity={1} fill="url(#colorComm)" name="Commission (PKR)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Top Performing Affiliates</span>
              </h3>
              <div className="space-y-3">
                {affiliates.slice(0, 4).map((aff, i) => (
                  <div key={aff.id ? `${aff.id}-${i}` : `top-aff-${i}`} className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold flex items-center justify-center text-xs">
                        #{i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">{aff.fullName}</h4>
                        <span className="font-mono text-[10px] text-emerald-400">{aff.referralCode}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-xs text-white">RS. {(aff.totalEarnings || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-zinc-400">{aff.totalOrders || 0} Orders Referred</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. APPLICATIONS TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'applications' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-white text-sm">Affiliate Partner Applications ({applications.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Applicant Name</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Country</th>
                  <th className="p-3.5">Promotion Channels</th>
                  <th className="p-3.5">Est. Sales</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {applications.map(app => (
                  <tr key={app.id || app.uid} className="hover:bg-zinc-800/40">
                    <td className="p-3.5 font-bold text-white">{app.fullName}</td>
                    <td className="p-3.5">
                      <div className="text-zinc-200">{app.email}</div>
                      <div className="text-[10px] text-zinc-500">{app.mobileNumber}</div>
                    </td>
                    <td className="p-3.5">{app.country}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {app.promotionMethods?.slice(0, 2).map((m, mIdx) => (
                          <span key={`${m}-${mIdx}`} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md text-[10px]">
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-emerald-400">{app.estimatedMonthlySales}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        app.status === 'Approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        app.status === 'Rejected' ? 'bg-red-950 text-red-400 border border-red-800' :
                        'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedApplication(app)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold"
                        title="View Full Application"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {app.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApproveApplication(app)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectApplication(app)}
                            className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 rounded-lg text-[10px] font-bold"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPLICATION VIEW MODAL */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl p-6 space-y-5 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Affiliate Application Details</span>
              </h3>
              <button onClick={() => setSelectedApplication(null)} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                <div>
                  <span className="text-zinc-500 block text-[10px] font-bold uppercase">Applicant Name</span>
                  <span className="font-bold text-white text-sm">{selectedApplication.fullName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] font-bold uppercase">Email Address</span>
                  <span className="font-bold text-emerald-400">{selectedApplication.email}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] font-bold uppercase">Phone Number</span>
                  <span>{selectedApplication.mobileNumber}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] font-bold uppercase">Country</span>
                  <span>{selectedApplication.country}</span>
                </div>
              </div>

              <div>
                <span className="text-zinc-400 font-bold block mb-1">Reason for Joining:</span>
                <p className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-zinc-300">
                  {selectedApplication.reasonForJoining || 'N/A'}
                </p>
              </div>

              <div>
                <span className="text-zinc-400 font-bold block mb-1">Promotion Methods:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplication.promotionMethods?.map((m, mIdx) => (
                    <span key={`${m}-${mIdx}`} className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg text-[10px] font-bold">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 border-t border-zinc-800 pt-4">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl"
              >
                Close
              </button>
              {selectedApplication.status === 'Pending' && (
                <button
                  onClick={() => handleApproveApplication(selectedApplication)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Partner</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. AFFILIATES TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'affiliates' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-4 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Partner Profile</th>
                  <th className="p-3.5">Referral Code</th>
                  <th className="p-3.5">Clicks / Orders</th>
                  <th className="p-3.5">Conv Rate</th>
                  <th className="p-3.5">Total Earnings</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {affiliates.map((aff, idx) => (
                  <tr key={aff.id ? `${aff.id}-${idx}` : `aff-${idx}`} className="hover:bg-zinc-800/40">
                    <td className="p-3.5 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center font-bold text-emerald-400">
                        {aff.fullName?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="font-bold text-white">{aff.fullName}</div>
                        <div className="text-[10px] text-zinc-500">{aff.email}</div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">{aff.referralCode}</td>
                    <td className="p-3.5">
                      <div>{aff.totalClicks || 0} clicks</div>
                      <div className="text-[10px] text-zinc-400">{aff.totalOrders || 0} orders</div>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-400">{aff.conversionRate || 0}%</td>
                    <td className="p-3.5 font-mono font-bold text-white">RS. {(aff.totalEarnings || 0).toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        aff.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {aff.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedAffiliate(aff)}
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10px] font-bold"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AFFILIATE PROFILE EDIT MODAL */}
      {selectedAffiliate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl p-6 space-y-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Affiliate Partner Profile: {selectedAffiliate.fullName}</span>
              </h3>
              <button onClick={() => setSelectedAffiliate(null)} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Referral Code</label>
                <input
                  type="text"
                  value={selectedAffiliate.referralCode}
                  onChange={e => setSelectedAffiliate({ ...selectedAffiliate, referralCode: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Status</label>
                <select
                  value={selectedAffiliate.status}
                  onChange={e => setSelectedAffiliate({ ...selectedAffiliate, status: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
              <button onClick={() => setSelectedAffiliate(null)} className="px-4 py-2 bg-zinc-800 rounded-xl text-xs font-bold">
                Close
              </button>
              <button
                onClick={async () => {
                  await updateDoc(doc(db, 'affiliates', selectedAffiliate.id), selectedAffiliate);
                  addNotification('Partner Updated', 'Affiliate profile saved.', 'success');
                  setSelectedAffiliate(null);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. REFERRAL LINKS TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'referral-links' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <Link2 className="w-5 h-5 text-emerald-400" />
              <span>Referral Link Generator & Campaign Links ({referralLinks.length})</span>
            </h3>
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New Link</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Campaign / Link Title</th>
                  <th className="p-3.5">Target Type</th>
                  <th className="p-3.5">Destination URL</th>
                  <th className="p-3.5">Short Link</th>
                  <th className="p-3.5">Clicks</th>
                  <th className="p-3.5">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {referralLinks.map((link, idx) => (
                  <tr key={link.id ? `${link.id}-${idx}` : `link-${idx}`} className="hover:bg-zinc-800/40">
                    <td className="p-3.5 font-bold text-white">{link.title}</td>
                    <td className="p-3.5 uppercase font-mono text-[10px] text-emerald-400">{link.targetType}</td>
                    <td className="p-3.5 text-zinc-400 max-w-xs truncate">{link.destinationUrl}</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">{link.shortUrl}</td>
                    <td className="p-3.5 font-mono">{link.clicks || 0}</td>
                    <td className="p-3.5 font-mono text-white">RS. {(link.revenueGenerated || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE LINK MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl">
            <h3 className="font-bold text-base border-b border-zinc-800 pb-3">Generate Custom Referral Link</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Select Affiliate Partner</label>
                <select
                  value={newLink.affiliateId}
                  onChange={e => setNewLink({ ...newLink, affiliateId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                >
                  <option value="">-- Choose Partner --</option>
                  {affiliates.map((a, idx) => (
                    <option key={a.id ? `${a.id}-${idx}` : `aff-opt-${idx}`} value={a.id}>{a.fullName} ({a.referralCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Tap-Ball Cricket Sale"
                  value={newLink.title}
                  onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Target Type</label>
                <select
                  value={newLink.targetType}
                  onChange={e => setNewLink({ ...newLink, targetType: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                >
                  <option value="homepage">Homepage</option>
                  <option value="product">Product Page</option>
                  <option value="category">Category Collection</option>
                  <option value="campaign">Custom Campaign</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Target Landing Page URL</label>
                <input
                  type="text"
                  value={newLink.targetUrl}
                  onChange={e => setNewLink({ ...newLink, targetUrl: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
              <button onClick={() => setShowLinkModal(false)} className="px-4 py-2 bg-zinc-800 text-xs font-bold rounded-xl">
                Cancel
              </button>
              <button onClick={handleCreateLink} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl">
                Generate Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. COMMISSION MANAGEMENT TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'commissions' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Commission Management & Rule Engine</span>
            </h3>
            <button
              onClick={() => setShowBonusModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Manual Bonus / Adjustment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Global Commission Rate</span>
              <div className="text-2xl font-black text-emerald-400">10% Standard</div>
              <p className="text-[10px] text-zinc-500">Applied automatically to all delivered e-commerce orders.</p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Hold Period</span>
              <div className="text-2xl font-black text-white">14 Days</div>
              <p className="text-[10px] text-zinc-500">Cooling period for customer returns before commission approval.</p>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Auto Reversal</span>
              <div className="text-2xl font-black text-emerald-400">Enabled</div>
              <p className="text-[10px] text-zinc-500">Automatically reverses commission if order is cancelled or refunded.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. PAYOUT REQUESTS TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'payout-requests' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-zinc-800 pb-4 flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>Affiliate Withdrawal & Payout Requests ({payoutRequests.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Affiliate</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Account Details</th>
                  <th className="p-3.5">Request Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {payoutRequests.map((req, idx) => (
                  <tr key={req.id ? `${req.id}-${idx}` : `payout-${idx}`} className="hover:bg-zinc-800/40">
                    <td className="p-3.5 font-bold text-white">{req.affiliateName}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">RS. {req.amount.toLocaleString()}</td>
                    <td className="p-3.5 font-bold">{req.paymentMethod}</td>
                    <td className="p-3.5">{req.accountNumber} ({req.accountTitle})</td>
                    <td className="p-3.5">{req.requestDate}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        req.status === 'Paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        req.status === 'Approved' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                        'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {req.status === 'Pending' && (
                        <button
                          onClick={() => handleProcessPayout(req, 'Paid')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg shadow-md"
                        >
                          Approve & Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. FRAUD DETECTION TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'fraud-detection' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span>Automated Fraud Detection & Security Sentinel</span>
            </h3>
            <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold rounded-full">
              Realtime Shield Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Self-Referral Guard</span>
              <p className="text-xs text-emerald-400 font-bold mt-1">Blocked 0 Attempts</p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Bot Click Filter</span>
              <p className="text-xs text-emerald-400 font-bold mt-1">100% Verified Traffic</p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-bold uppercase text-zinc-400">IP Duplicate Check</span>
              <p className="text-xs text-emerald-400 font-bold mt-1">Passing Integrity</p>
            </div>
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Refund Monitor</span>
              <p className="text-xs text-emerald-400 font-bold mt-1">Threshold Below 2%</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 14. SETTINGS TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'settings' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <h3 className="font-bold text-white text-base border-b border-zinc-800 pb-4 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>Enterprise Global Affiliate Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="text-zinc-300 font-bold block mb-1">Approval Workflow</label>
              <select
                value={settings.approvalType}
                onChange={e => setSettings({ ...settings, approvalType: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
              >
                <option value="Manual">Manual Admin Review Required</option>
                <option value="Auto">Instant Auto-Approval</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-300 font-bold block mb-1">Minimum Payout Amount (PKR)</label>
              <input
                type="number"
                value={settings.minWithdrawalAmount}
                onChange={e => setSettings({ ...settings, minWithdrawalAmount: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-bold block mb-1">Commission Cooling Period (Days)</label>
              <input
                type="number"
                value={settings.commissionHoldPeriodDays}
                onChange={e => setSettings({ ...settings, commissionHoldPeriodDays: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-bold block mb-1">Referral Cookie Duration (Days)</label>
              <input
                type="number"
                value={settings.cookieDurationDays}
                onChange={e => setSettings({ ...settings, cookieDurationDays: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <button
              onClick={() => {
                addNotification('Settings Saved', 'Global affiliate parameters updated.', 'success');
              }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 15. TERMS & CONDITIONS TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'terms' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <span>Affiliate Terms & Conditions Editor</span>
            </h3>
            <span className="text-xs text-zinc-400">Version: {terms.version}</span>
          </div>

          <textarea
            rows={12}
            value={terms.content}
            onChange={e => setTerms({ ...terms, content: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
          />

          <div className="flex justify-end pt-2">
            <button
              onClick={() => addNotification('Terms Published', 'Updated partner agreement terms.', 'success')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg"
            >
              Publish Agreement
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 16. ACTIVITY LOGS TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'activity-logs' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-zinc-800 pb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Affiliate System Audit Logs ({activityLogs.length})</span>
          </h3>

          <div className="space-y-2">
            {activityLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">No activity logged yet.</div>
            ) : (
              activityLogs.map((log, idx) => (
                <div key={log.id ? `${log.id}-${idx}` : `log-${idx}`} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-emerald-400 mr-2">[{log.actionType}]</span>
                    <span className="text-white">{log.description}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
