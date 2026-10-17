import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, Coins, TrendingUp, Users, Share2, DollarSign, 
  CheckCircle2, Award, Sparkles, Clock, Copy, Check, 
  ExternalLink, ChevronRight, Search, Percent, ArrowUpRight, 
  Briefcase, Calendar, ShieldCheck, AlertCircle, Phone, Mail,
  MapPin, Globe, QrCode, Download, Send, Filter, RefreshCw,
  Bell, Lock, User, FileText, CheckCircle, XCircle, ChevronDown,
  Building, CreditCard, Wallet, Laptop, ShieldAlert, LogIn
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { AffiliateApplication, EnterpriseAffiliate, Order } from '../types';
import { AffiliateTermsModal } from '../components/AffiliateTermsModal';

export const AffiliatePortalView: React.FC = () => {
  const { 
    currentUser, 
    currentAffiliate, 
    currentAffiliateApplication,
    products, 
    addNotification, 
    setCurrentView,
    submitAffiliateApplication,
    submitWithdrawalRequest,
    affiliateReferrals,
    affiliateWithdrawals,
    notifications,
    updateProfile,
    orders
  } = useApp();

  // Primary active tab inside the portal
  const [activeTab, setActiveTab] = useState<'dashboard' | 'links' | 'orders' | 'withdraw' | 'profile' | 'notifications'>('dashboard');

  // Link Generator State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [campaignTag, setCampaignTag] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [customLinkTitle, setCustomLinkTitle] = useState<string>('');

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'approved' | 'cancelled'>('all');

  // Withdrawal Form States
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<'Bank Transfer' | 'JazzCash' | 'EasyPaisa' | 'NayaPay'>('EasyPaisa');
  const [accountTitleInput, setAccountTitleInput] = useState<string>('');
  const [accountNumberInput, setAccountNumberInput] = useState<string>('');
  const [bankNameInput, setBankNameInput] = useState<string>('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState<boolean>(false);

  // Application Registration Form States
  const [fullNameApp, setFullNameApp] = useState(currentUser?.fullName || '');
  const [phoneApp, setPhoneApp] = useState(currentUser?.phone || '');
  const [countryApp, setCountryApp] = useState('Pakistan');
  const [provinceApp, setProvinceApp] = useState('Punjab');
  const [cityApp, setCityApp] = useState('');
  const [addressApp, setAddressApp] = useState('');
  const [payMethodApp, setPayMethodApp] = useState<'Bank' | 'JazzCash' | 'EasyPaisa' | 'NayaPay'>('EasyPaisa');
  const [accTitleApp, setAccTitleApp] = useState('');
  const [accNumberApp, setAccNumberApp] = useState('');
  const [fbApp, setFbApp] = useState('');
  const [instaApp, setInstaApp] = useState('');
  const [tiktokApp, setTiktokApp] = useState('');
  const [ytApp, setYtApp] = useState('');
  const [webApp, setWebApp] = useState('');
  const [marketingMethodApp, setMarketingMethodApp] = useState<string[]>(['Social Media']);
  const [salesVolumeApp, setSalesVolumeApp] = useState('Rs. 10,000 - Rs. 50,000');
  const [motivationApp, setMotivationApp] = useState('');
  const [termsAgreedApp, setTermsAgreedApp] = useState(false);
  const [isTermsModalOpenApp, setIsTermsModalOpenApp] = useState(false);
  const [appErrors, setAppErrors] = useState<Record<string, string>>({});
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  // Profile Edit States
  const [editFullName, setEditFullName] = useState(currentUser?.fullName || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState('');
  const [editPayMethod, setEditPayMethod] = useState<'Bank' | 'JazzCash' | 'EasyPaisa' | 'NayaPay'>('EasyPaisa');
  const [editAccTitle, setEditAccTitle] = useState('');
  const [editAccNumber, setEditAccNumber] = useState('');
  const [editFb, setEditFb] = useState('');
  const [editInsta, setEditInsta] = useState('');
  const [editTiktok, setEditTiktok] = useState('');
  const [editYt, setEditYt] = useState('');
  const [editWeb, setEditWeb] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const referralCode = currentAffiliate?.referralCode || `PAK-${(currentUser?.fullName || 'USER').slice(0, 3).toUpperCase()}-1082`;
  const baseUrl = window.location.origin;
  const globalReferralLink = `${baseUrl}/?ref=${referralCode}`;

  // Calculated Stats
  const totalClicks = currentAffiliate?.totalClicks ?? 0;
  const totalOrdersCount = currentAffiliate?.totalReferrals ?? 0;
  const totalEarned = currentAffiliate?.totalEarnings ?? 0;
  const pendingCommission = currentAffiliate?.pendingCommission ?? 0;
  const paidCommission = currentAffiliate?.paidCommission ?? 0;
  const approvedCommission = Math.max(0, totalEarned - pendingCommission);
  const availableBalance = Math.max(0, approvedCommission - paidCommission); // only approved, unpaid commission is withdrawable
  const conversionRate = totalClicks > 0 ? ((totalOrdersCount / totalClicks) * 100).toFixed(1) : '0.0';

  // Level Badge calculation
  const getAffiliateTier = (ordersCount: number) => {
    if (ordersCount >= 200) return { name: 'Platinum Partner', badge: '💎 Platinum', bonus: '15% Bonus' };
    if (ordersCount >= 50) return { name: 'Gold Partner', badge: '🥇 Gold', bonus: '10% Bonus' };
    if (ordersCount >= 10) return { name: 'Silver Partner', badge: '🥈 Silver', bonus: '5% Bonus' };
    return { name: 'Bronze Partner', badge: '🥉 Bronze', bonus: 'Standard Rate' };
  };

  const tierInfo = getAffiliateTier(totalOrdersCount);

  // Referred orders derived list
  // Do not display fabricated referral orders; show only records returned by the affiliate API.
  const referredOrdersList = useMemo(() => [], []);

  // Filtered orders list
  const filteredReferredOrders = useMemo(() => {
    return referredOrdersList.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                            o.productName.toLowerCase().includes(orderSearch.toLowerCase());
      if (!matchesSearch) return false;
      if (orderStatusFilter === 'pending') return o.status.includes('Pending');
      if (orderStatusFilter === 'approved') return o.status === 'Approved';
      if (orderStatusFilter === 'cancelled') return o.status === 'Cancelled';
      return true;
    });
  }, [referredOrdersList, orderSearch, orderStatusFilter]);

  // Chart data
  const trendChartData = useMemo(() => [], []);

  // Category distribution data
  const categoryPieData: { name: string; value: number; color: string }[] = [];

  // Helper copy function
  const copyToClipboard = (text: string, label: string, idStr: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idStr);
    addNotification('Link Copied', `${label} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Generate customized referral link
  const handleGenerateCustomLink = () => {
    let url = baseUrl;
    if (selectedProductId) {
      url += `/?ref=${referralCode}&pid=${selectedProductId}`;
    } else if (selectedCategory) {
      url += `/?ref=${referralCode}&cat=${encodeURIComponent(selectedCategory)}`;
    } else {
      url += `/?ref=${referralCode}`;
    }
    if (campaignTag.trim()) {
      url += `&utm_campaign=${encodeURIComponent(campaignTag.trim())}`;
    }
    setGeneratedLink(url);
    addNotification('Referral Link Generated', 'Custom trackable referral link generated successfully!', 'success');
  };

  // Submit withdrawal request
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum < 1000) {
      addNotification('Invalid Amount', 'Minimum withdrawal request is Rs. 1,000.', 'warning');
      return;
    }
    if (amountNum > availableBalance) {
      addNotification('Insufficient Balance', 'Requested amount exceeds available commission balance.', 'warning');
      return;
    }
    if (!accountTitleInput.trim() || !accountNumberInput.trim()) {
      addNotification('Missing Payout Details', 'Please enter your account title and number.', 'warning');
      return;
    }

    setIsSubmittingWithdraw(true);
    const detailsStr = `${withdrawMethod}: ${bankNameInput ? bankNameInput + ' - ' : ''}Title: ${accountTitleInput.trim()} | Acc#: ${accountNumberInput.trim()}`;
    const res = await submitWithdrawalRequest(amountNum, withdrawMethod, detailsStr);
    setIsSubmittingWithdraw(false);

    if (res.success) {
      setWithdrawAmount('');
      setAccountTitleInput('');
      setAccountNumberInput('');
      setBankNameInput('');
    }
  };

  // Handle Application Submission
  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!fullNameApp.trim()) errs.fullName = 'Full Name is required';
    if (!phoneApp.trim()) errs.phone = 'Mobile number is required';
    if (!cityApp.trim()) errs.city = 'City name is required';
    if (!addressApp.trim()) errs.address = 'Complete address is required';
    if (!accTitleApp.trim()) errs.accTitle = 'Account title is required';
    if (!accNumberApp.trim()) errs.accNumber = 'Account/wallet number is required';
    if (!motivationApp.trim() || motivationApp.trim().length < 30) errs.motivation = 'Please explain your marketing strategy in at least 30 characters';
    if (!termsAgreedApp) errs.terms = 'You must accept the terms and conditions';

    if (Object.keys(errs).length > 0) {
      setAppErrors(errs);
      return;
    }

    setIsSubmittingApp(true);
    const success = await submitAffiliateApplication({
      fullName: fullNameApp.trim(),
      email: currentUser?.email?.toLowerCase() || 'partner@example.pk',
      mobileNumber: phoneApp.trim(),
      country: countryApp,
      address: `${addressApp.trim()}, ${cityApp.trim()}, ${provinceApp}, ${countryApp}`,
      socialMedia: {
        facebook: fbApp.trim(),
        instagram: instaApp.trim(),
        tiktok: tiktokApp.trim(),
        youtube: ytApp.trim(),
        website: webApp.trim(),
        linkedin: ''
      },
      previousAffiliateExperience: true,
      previousAffiliatePrograms: 'Worked with local e-commerce networks',
      promotionMethods: marketingMethodApp,
      otherPromotionMethod: '',
      reasonForJoining: motivationApp.trim(),
      estimatedMonthlySales: salesVolumeApp,
      acceptedTerms: termsAgreedApp,
    });
    setIsSubmittingApp(false);
  };

  // Handle Profile Update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    updateProfile({
      fullName: editFullName.trim(),
      phone: editPhone.trim()
    });
    setTimeout(() => {
      setIsSavingProfile(false);
      addNotification('Profile Updated', 'Your affiliate profile and payout details have been saved.', 'success');
    }, 600);
  };

  // -------------------------------------------------------------
  // CONDITIONAL VIEW 1: NOT LOGGED IN
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 text-[#0F9D58] rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100 dark:border-emerald-800">
          <Briefcase size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Pak-Tajarat Affiliate Portal</h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
            Log in to access your partner dashboard, generate trackable referral links, track earnings, and request cashouts.
          </p>
        </div>
        <button
          onClick={() => setCurrentView('auth')}
          className="bg-[#0F9D58] hover:bg-[#0b8043] text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          <LogIn size={16} />
          <span>Login / Register Now</span>
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CONDITIONAL VIEW 2: APPLICATION PENDING REVIEW
  // -------------------------------------------------------------
  if (currentAffiliateApplication && currentAffiliateApplication.status === 'Pending' && !currentAffiliate) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-300 text-left">
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-[32px] shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-amber-500/20 mb-2">
                <Clock size={13} className="animate-pulse" />
                <span>Under Review</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Affiliate Enrollment Pending
              </h2>
            </div>
            <div className="text-xs text-gray-400 font-mono">
              App ID: <span className="font-bold text-gray-700 dark:text-gray-300">{currentAffiliateApplication.uid.slice(0, 10)}</span>
            </div>
          </div>

          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-5 rounded-2xl text-xs text-amber-900 dark:text-amber-300 leading-relaxed font-medium flex items-start space-x-3">
            <Clock size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold text-sm mb-1">Thank you for applying, {currentAffiliateApplication.fullName}!</p>
              <p>
                Our compliance team is reviewing your marketing details and social channels. Applications are usually verified within 24–48 hours. You will receive an instant notification right here as soon as your account is activated.
              </p>
            </div>
          </div>

          {/* Submitted Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-2xl space-y-1 border border-gray-100 dark:border-zinc-800/80">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Applicant Name</span>
              <p className="font-bold text-gray-900 dark:text-white">{currentAffiliateApplication.fullName}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-2xl space-y-1 border border-gray-100 dark:border-zinc-800/80">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Mobile & Email</span>
              <p className="font-bold text-gray-900 dark:text-white">{currentAffiliateApplication.mobileNumber} • {currentAffiliateApplication.email}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-2xl space-y-1 border border-gray-100 dark:border-zinc-800/80">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Estimated Monthly Sales</span>
              <p className="font-bold text-gray-900 dark:text-white">{currentAffiliateApplication.estimatedMonthlySales}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-2xl space-y-1 border border-gray-100 dark:border-zinc-800/80">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Submission Date</span>
              <p className="font-bold text-gray-900 dark:text-white">{new Date(currentAffiliateApplication.submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-gray-100 dark:border-zinc-800">
            <button
              onClick={() => setCurrentView('home')}
              className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 font-bold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Return to Store Front</span>
            </button>
            <span className="text-[11px] text-[#0F9D58] font-bold">Pak-Tajarat Partner Network</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CONDITIONAL VIEW 3: NO APPLICATION FILED -> "Apply to Become an Affiliate"
  // -------------------------------------------------------------
  if (!currentAffiliateApplication && !currentAffiliate) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-300 text-left">
        
        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-[#0B1B3D] via-[#183661] to-[#0F9D58] p-8 md:p-10 rounded-[32px] text-white shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-200 border border-white/20">
            <Sparkles size={13} />
            <span>Official Partner Program</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
            Apply to Become an Affiliate Partner
          </h1>
          <p className="text-xs md:text-sm text-gray-200 max-w-2xl leading-relaxed">
            Earn high commission payouts by promoting Pak-Tajarat's wide catalog of electronics, fashion, and home products. Get direct access to trackable links, marketing banners, and weekly automatic cashouts.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/20 text-xs">
            <div>
              <span className="text-[10px] text-emerald-200 font-bold block uppercase">Commission Rate</span>
              <span className="text-lg font-black font-mono">Up to 15%</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 font-bold block uppercase">Minimum Payout</span>
              <span className="text-lg font-black font-mono">Rs. 1,000</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 font-bold block uppercase">Cookie Duration</span>
              <span className="text-lg font-black font-mono">30 Days</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 font-bold block uppercase">Payment Methods</span>
              <span className="text-xs font-bold block mt-1">JazzCash, EasyPaisa, Bank</span>
            </div>
          </div>
        </div>

        {/* Enrollment Form */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-[32px] shadow-xl space-y-8">
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={20} className="text-[#0F9D58]" />
              <span>Partner Registration Form</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Complete all details below to submit your application to the Pak-Tajarat affiliate network.
            </p>
          </div>

          <form onSubmit={handleAppSubmit} className="space-y-8">
            
            {/* Section 1: Personal & Contact */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#0F9D58] uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-2">
                1. Personal & Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={fullNameApp}
                    onChange={(e) => setFullNameApp(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                  {appErrors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1">{appErrors.fullName}</p>}
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">Email Address (Account Email)</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">Mobile Number *</label>
                  <input
                    type="tel"
                    value={phoneApp}
                    onChange={(e) => setPhoneApp(e.target.value)}
                    placeholder="e.g. 03001234567"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                  {appErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{appErrors.phone}</p>}
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">Country *</label>
                  <select
                    value={countryApp}
                    onChange={(e) => setCountryApp(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="Pakistan">Pakistan</option>
                    <option value="UAE">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="UK">United Kingdom</option>
                    <option value="USA">United States</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">Province *</label>
                  <select
                    value={provinceApp}
                    onChange={(e) => setProvinceApp(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                    <option value="Azad Kashmir">Azad Kashmir</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">City *</label>
                  <input
                    type="text"
                    value={cityApp}
                    onChange={(e) => setCityApp(e.target.value)}
                    placeholder="e.g. Lahore / Karachi"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                  {appErrors.city && <p className="text-[10px] text-red-500 font-bold mt-1">{appErrors.city}</p>}
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5 text-xs">Complete Address *</label>
                <input
                  type="text"
                  value={addressApp}
                  onChange={(e) => setAddressApp(e.target.value)}
                  placeholder="House/Street Number, Sector/Area, Complete Postal Address"
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
                {appErrors.address && <p className="text-[10px] text-red-500 font-bold mt-1">{appErrors.address}</p>}
              </div>
            </div>

            {/* Section 2: Preferred Payment Method */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#0F9D58] uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-2">
                2. Preferred Payment Method for Earnings Cashout
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">Payment Method *</label>
                  <select
                    value={payMethodApp}
                    onChange={(e: any) => setPayMethodApp(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none font-semibold"
                  >
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="NayaPay">NayaPay</option>
                    <option value="Bank">Bank Transfer (IBAN)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">Account Title *</label>
                  <input
                    type="text"
                    value={accTitleApp}
                    onChange={(e) => setAccTitleApp(e.target.value)}
                    placeholder="Exact name on account/wallet"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                  {appErrors.accTitle && <p className="text-[10px] text-red-500 font-bold mt-1">{appErrors.accTitle}</p>}
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">Account Number / IBAN *</label>
                  <input
                    type="text"
                    value={accNumberApp}
                    onChange={(e) => setAccNumberApp(e.target.value)}
                    placeholder="Mobile Wallet # or Bank IBAN"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none font-mono"
                  />
                  {appErrors.accNumber && <p className="text-[10px] text-red-500 font-bold mt-1">{appErrors.accNumber}</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Social Media & Marketing Method */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#0F9D58] uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-2">
                3. Social Media & Promotion Channels
              </h3>

              {/* Approval Boost Banner */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/30 dark:via-zinc-900 dark:to-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl flex items-start space-x-3">
                <Sparkles size={18} className="text-[#0F9D58] shrink-0 mt-0.5 animate-bounce" />
                <div className="text-xs text-emerald-950 dark:text-emerald-300">
                  <p className="font-extrabold flex items-center gap-1">
                    <span>Approval Chance Boost!</span>
                  </p>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5 leading-relaxed font-medium">
                    Adding your TikTok, Instagram, YouTube, Facebook, or Website links increases your application approval chances by <strong>80%</strong>!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Facebook Profile / Page</label>
                  <input
                    type="text"
                    value={fbApp}
                    onChange={(e) => setFbApp(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={instaApp}
                    onChange={(e) => setInstaApp(e.target.value)}
                    placeholder="@yourhandle or instagram URL"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">TikTok Profile</label>
                  <input
                    type="text"
                    value={tiktokApp}
                    onChange={(e) => setTiktokApp(e.target.value)}
                    placeholder="@tiktok_user"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">YouTube Channel URL</label>
                  <input
                    type="text"
                    value={ytApp}
                    onChange={(e) => setYtApp(e.target.value)}
                    placeholder="https://youtube.com/@c/channel"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1 text-xs">Website URL (Optional)</label>
                <input
                  type="text"
                  value={webApp}
                  onChange={(e) => setWebApp(e.target.value)}
                  placeholder="https://yourblog.com"
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5 text-xs">Marketing Strategy & Motivation *</label>
                <textarea
                  value={motivationApp}
                  onChange={(e) => setMotivationApp(e.target.value)}
                  rows={4}
                  placeholder="Explain how you plan to market products (e.g. WhatsApp status, Instagram stories, tech review blog)..."
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl p-4 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
                {appErrors.motivation && <p className="text-[10px] text-red-500 font-bold mt-1">{appErrors.motivation}</p>}
              </div>

              <div className="pt-2">
                <label className="flex items-start space-x-3 cursor-pointer text-xs text-gray-700 dark:text-gray-300 font-medium">
                  <input
                    type="checkbox"
                    checked={termsAgreedApp}
                    onChange={(e) => setTermsAgreedApp(e.target.checked)}
                    className="w-4 h-4 text-[#0F9D58] focus:ring-[#0F9D58] rounded border-gray-300 mt-0.5"
                  />
                  <span>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsTermsModalOpenApp(true);
                      }}
                      className="text-[#0F9D58] hover:underline font-black border-b border-dashed border-[#0F9D58] cursor-pointer"
                    >
                      Pak-Tajarat Affiliate Program Terms & Conditions
                    </button>
                    . I understand that fraudulent clicks and unauthorized spam distribution are grounds for immediate suspension.
                  </span>
                </label>
                {appErrors.terms && <p className="text-[10px] text-red-500 font-bold mt-1">{appErrors.terms}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingApp}
              className="w-full bg-[#0F9D58] hover:bg-[#0b8043] disabled:opacity-50 text-white font-black text-sm py-4 rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {isSubmittingApp ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <span>Submit Partner Application</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN AFFILIATE USER PORTAL (APPROVED / ACTIVE)
  // -------------------------------------------------------------
  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto pb-20 text-left" id="affiliate-portal-main">
      
      {/* Portal Top Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-[28px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F9D58] to-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            {currentUser.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {currentUser.fullName}
              </h1>
              <span className="bg-emerald-500/10 text-[#0F9D58] text-[10px] font-black px-3 py-0.5 rounded-full border border-emerald-500/20">
                {tierInfo.badge}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
              <span>Ref Code: <strong className="font-mono text-gray-700 dark:text-gray-300">{referralCode}</strong></span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">{tierInfo.bonus}</span>
            </p>
          </div>
        </div>

        {/* Global Link Quick Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-gray-50 dark:bg-zinc-950 p-2.5 rounded-2xl border border-gray-100 dark:border-zinc-800">
          <div className="px-3 min-w-0">
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block">Global Referral Link</span>
            <p className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 truncate max-w-xs">{globalReferralLink}</p>
          </div>
          <button
            onClick={() => copyToClipboard(globalReferralLink, 'Global Referral Link', 'global-top')}
            className="bg-[#0F9D58] hover:bg-[#0b8043] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            {copiedId === 'global-top' ? <CheckCircle size={14} /> : <Copy size={14} />}
            <span>{copiedId === 'global-top' ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Primary Portal Navigation Bar */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-zinc-800 space-x-1 sm:space-x-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-5 py-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard'
              ? 'border-[#0F9D58] text-[#0F9D58]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400'
          }`}
        >
          <TrendingUp size={16} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`px-5 py-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'links'
              ? 'border-[#0F9D58] text-[#0F9D58]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400'
          }`}
        >
          <Share2 size={16} />
          <span>Referral Links & Tools</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#0F9D58] text-[#0F9D58]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400'
          }`}
        >
          <Coins size={16} />
          <span>Referred Orders</span>
          <span className="bg-emerald-500/10 text-[#0F9D58] text-[9px] font-black px-2 py-0.5 rounded-full">
            {referredOrdersList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('withdraw')}
          className={`px-5 py-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'withdraw'
              ? 'border-[#0F9D58] text-[#0F9D58]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400'
          }`}
        >
          <DollarSign size={16} />
          <span>Withdrawals & Payouts</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'border-[#0F9D58] text-[#0F9D58]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400'
          }`}
        >
          <User size={16} />
          <span>Settings & Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-5 py-3.5 text-xs font-black border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-[#0F9D58] text-[#0F9D58]'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400'
          }`}
        >
          <Bell size={16} />
          <span>Notifications</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 1: DASHBOARD OVERVIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Key Metric Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Total Earnings</span>
                <Coins size={16} className="text-[#0F9D58]" />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">
                Rs. {totalEarned.toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold block">Lifetime commissions</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Available Balance</span>
                <DollarSign size={16} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-[#0F9D58] font-mono">
                Rs. {availableBalance.toLocaleString()}
              </p>
              <button
                onClick={() => setActiveTab('withdraw')}
                className="text-[10px] font-black text-[#0F9D58] hover:underline block"
              >
                Cashout Funds →
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Orders Referred</span>
                <Coins size={16} className="text-blue-500" />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">
                {totalOrdersCount}
              </p>
              <span className="text-[10px] text-gray-400 font-bold block">Delivered purchases</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Total Clicks</span>
                <Share2 size={16} className="text-purple-500" />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">
                {totalClicks}
              </p>
              <span className="text-[10px] text-purple-600 font-bold block">{conversionRate}% Conversion</span>
            </div>

          </div>

          {/* Interactive Trend Chart */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-[28px] shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Commissions & Traffic Trend (7 Days)
                </h3>
                <p className="text-xs text-gray-400">Daily click traffic vs earned commission payout</p>
              </div>
              <span className="text-xs font-bold text-[#0F9D58] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Live Data
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F9D58" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0F9D58" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} 
                  />
                  <Area type="monotone" dataKey="Earnings" stroke="#0F9D58" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: REFERRAL LINKS & TOOLS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'links' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Custom Link Generator Tool */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-[28px] shadow-sm space-y-6">
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Share2 size={20} className="text-[#0F9D58]" />
                <span>Trackable Referral Link Generator</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Select a product, category, or add campaign tags to create custom promotional links.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Target Product (Optional)</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    if (e.target.value) setSelectedCategory('');
                  }}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="">Store Homepage (Default)</option>
                  {products.map((p, idx) => (
                    <option key={p.id ? `${p.id}-${idx}` : `opt-${idx}`} value={p.id}>{p.name} - (Rs. {p.price.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Target Category (Optional)</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    if (e.target.value) setSelectedProductId('');
                  }}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Living">Home & Living</option>
                  <option value="Beauty">Beauty</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Campaign Tag (Optional)</label>
                <input
                  type="text"
                  value={campaignTag}
                  onChange={(e) => setCampaignTag(e.target.value)}
                  placeholder="e.g. facebook-ads-summer"
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateCustomLink}
              className="bg-[#0F9D58] hover:bg-[#0b8043] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={16} />
              <span>Generate Trackable Link</span>
            </button>

            {generatedLink && (
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-4 rounded-2xl space-y-2 animate-in fade-in duration-200">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-black uppercase tracking-wider block">Generated Custom Referral Link:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2 text-xs font-mono text-gray-800 dark:text-white"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedLink, 'Generated Link', 'custom-gen')}
                    className="bg-[#0F9D58] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#0b8043] transition-colors cursor-pointer shrink-0"
                  >
                    {copiedId === 'custom-gen' ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Catalog Products Quick Share Grid */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-[28px] shadow-sm space-y-6">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">High-Commission Catalog Products</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 6).map((p, idx) => {
                const prodRefLink = `${baseUrl}/?ref=${referralCode}&pid=${p.id}`;
                return (
                  <div key={p.id ? `${p.id}-${idx}` : `aff-prod-${idx}`} className="p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800/80 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div className="flex items-start space-x-3">
                      <img src={p.image || undefined} alt={p.name} className="w-14 h-14 object-cover rounded-xl border border-gray-200 dark:border-zinc-800 shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-black uppercase text-[#0F9D58] tracking-widest">{p.category}</span>
                        <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">{p.name}</h4>
                        <p className="text-xs font-mono font-bold text-gray-600 dark:text-gray-400 mt-0.5">Rs. {p.price.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">Earn ~10%</span>
                      <button
                        onClick={() => copyToClipboard(prodRefLink, p.name, `prod-${p.id}`)}
                        className="bg-[#0F9D58] hover:bg-[#0b8043] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {copiedId === `prod-${p.id}` ? <CheckCircle size={12} /> : <Copy size={12} />}
                        <span>{copiedId === `prod-${p.id}` ? 'Copied' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 3: REFERRED ORDERS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-[28px] shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Referred Customer Orders</h3>
                <p className="text-xs text-gray-400">Track orders generated through your affiliate links & cooling status</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e: any) => setOrderStatusFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Cooling (7 Days)</option>
                  <option value="approved">Approved</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-400 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-2">Order ID</th>
                    <th className="py-3 px-2">Product Name</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Order Value</th>
                    <th className="py-3 px-2">Commission</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Delivery Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 font-medium">
                  {filteredReferredOrders.map((o, idx) => (
                    <tr key={o.id ? `${o.id}-${idx}` : `ref-ord-${idx}`} className="hover:bg-gray-50/50 dark:hover:bg-zinc-850/50 transition-colors">
                      <td className="py-3.5 px-2 font-mono font-bold text-gray-900 dark:text-white">{o.id}</td>
                      <td className="py-3.5 px-2 font-bold text-gray-800 dark:text-gray-200">{o.productName} (x{o.quantity})</td>
                      <td className="py-3.5 px-2 text-gray-500 font-mono">{o.customerMasked}</td>
                      <td className="py-3.5 px-2 font-mono font-bold text-gray-800 dark:text-gray-200">Rs. {o.orderValue.toLocaleString()}</td>
                      <td className="py-3.5 px-2 font-mono font-bold text-[#0F9D58]">Rs. {o.commission.toLocaleString()}</td>
                      <td className="py-3.5 px-2">
                        {o.status === 'Approved' && (
                          <span className="bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                            Approved
                          </span>
                        )}
                        {o.status.includes('Pending') && (
                          <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                            Pending Cooling
                          </span>
                        )}
                        {o.status === 'Cancelled' && (
                          <span className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-gray-400 font-mono">{o.deliveryDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 4: WITHDRAWALS & PAYOUT HUB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'withdraw' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Balance Overview Card */}
            <div className="bg-gradient-to-br from-[#0F9D58] to-emerald-800 p-6 rounded-[28px] text-white space-y-4 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 block">Available Cashout Balance</span>
              <p className="text-3xl font-black font-mono">Rs. {availableBalance.toLocaleString()}</p>
              
              <div className="pt-2 border-t border-white/20 text-xs space-y-1 text-emerald-100">
                <p>• Minimum Cashout: <strong>Rs. 1,000</strong></p>
                <p>• Processing Time: <strong>24–48 Hours</strong></p>
                <p>• Approved Lifetime Paid: <strong>Rs. {paidCommission.toLocaleString()}</strong></p>
              </div>
            </div>

            {/* Withdrawal Request Form */}
            <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-[28px] shadow-sm space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Request Payout Withdrawal</h3>
              
              <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Amount to Cashout (PKR) *</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="e.g. 2500"
                      min={1000}
                      max={availableBalance}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white font-mono font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Payment Method *</label>
                    <select
                      value={withdrawMethod}
                      onChange={(e: any) => setWithdrawMethod(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white font-bold focus:outline-none"
                    >
                      <option value="EasyPaisa">EasyPaisa Mobile Wallet</option>
                      <option value="JazzCash">JazzCash Mobile Wallet</option>
                      <option value="NayaPay">NayaPay Account</option>
                      <option value="Bank Transfer">Bank Transfer (IBAN)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Account Title *</label>
                    <input
                      type="text"
                      value={accountTitleInput}
                      onChange={(e) => setAccountTitleInput(e.target.value)}
                      placeholder="Name on account"
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Account / IBAN Number *</label>
                    <input
                      type="text"
                      value={accountNumberInput}
                      onChange={(e) => setAccountNumberInput(e.target.value)}
                      placeholder="Mobile # or Bank IBAN"
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="bg-[#0F9D58] hover:bg-[#0b8043] disabled:opacity-50 text-white font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isSubmittingWithdraw ? <span>Processing...</span> : <span>Submit Cashout Request</span>}
                </button>
              </form>
            </div>

          </div>

          {/* Withdrawal History Table */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-[28px] shadow-sm space-y-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Withdrawal Transaction History</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-400 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-2">Request ID</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Amount</th>
                    <th className="py-3 px-2">Method & Details</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 font-medium">
                  {affiliateWithdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No withdrawal requests recorded yet.
                      </td>
                    </tr>
                  ) : (
                    affiliateWithdrawals.map((w, idx) => (
                      <tr key={w.id ? `${w.id}-${idx}` : `aff-w-${idx}`}>
                        <td className="py-3.5 px-2 font-mono font-bold text-gray-900 dark:text-white">{w.id}</td>
                        <td className="py-3.5 px-2 text-gray-500 font-mono">{w.date}</td>
                        <td className="py-3.5 px-2 font-mono font-bold text-[#0F9D58]">Rs. {w.amount.toLocaleString()}</td>
                        <td className="py-3.5 px-2 text-gray-700 dark:text-gray-300">{w.paymentMethod} • {w.paymentDetails}</td>
                        <td className="py-3.5 px-2 uppercase font-black text-[10px]">
                          <span className="bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 px-2.5 py-1 rounded-full">
                            {w.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 5: SETTINGS & PROFILE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-[28px] shadow-sm space-y-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-black text-gray-900 dark:text-white">Partner Profile Settings</h3>
          
          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Email Address (Read-only)</label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="bg-[#0F9D58] hover:bg-[#0b8043] text-white font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 6: NOTIFICATIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-[28px] shadow-sm space-y-4 animate-in fade-in duration-300">
          <h3 className="text-lg font-black text-gray-900 dark:text-white">Partner Notifications</h3>
          
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No notifications yet.</p>
            ) : (
              notifications.map((n, idx) => (
                <div key={n.id ? `${n.id}-${idx}` : `aff-notif-${idx}`} className="p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-2xl flex items-start space-x-3 text-xs">
                  <Bell size={16} className="text-[#0F9D58] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white">{n.title}</h4>
                    <p className="text-gray-500 mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-gray-400 font-mono mt-1 block">{n.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal Popup */}
      <AffiliateTermsModal 
        isOpen={isTermsModalOpenApp} 
        onClose={() => setIsTermsModalOpenApp(false)} 
        onAccept={() => setTermsAgreedApp(true)} 
      />

    </div>
  );
};
