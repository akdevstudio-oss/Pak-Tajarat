import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { 
  User, ClipboardList, Heart, MapPin, Bell, 
  Settings, LogOut, CheckCircle2, ShieldAlert,
  ChevronRight, Plus, Trash2, Edit2, ShieldCheck, Mail, Phone, Calendar,
  Coins, Users, Copy, Check, Share2, DollarSign, TrendingUp, Award, Briefcase, Clock, Sparkles
} from 'lucide-react';
import { AffiliateApplicationStatus } from '../components/AffiliateApplicationStatus';

export const UserDashboardView: React.FC = () => {
  const {
    currentUser,
    orders,
    products,
    wishlist,
    toggleWishlist,
    notifications,
    markNotificationRead,
    clearNotifications,
    updateProfile,
    logout,
    setCurrentView,
    // Affiliate integration
    currentAffiliate,
    currentAffiliateApplication,
    registerAsAffiliate,
    affiliateReferrals,
    affiliateWithdrawals,
    submitWithdrawalRequest,
    commissionRate,
    activeDashboardTab,
    setActiveDashboardTab,
    verifyEmailDemo,
    activateAffiliateDemo,
    approveAffiliateDemo,
    processCoolingCommissions,
    fastForwardCoolingCommissions
  } = useApp();

  const activeTab = activeDashboardTab;
  const setActiveTab = setActiveDashboardTab;

  // Affiliate portal sub-tabs
  const [affSubTab, setAffSubTab] = useState<'overview' | 'products'>('overview');
  const [copiedProdId, setCopiedProdId] = useState<string | null>(null);

  // Profile Edit Forms States
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  // Address Forms States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressTitle, setAddressTitle] = useState('Home');
  const [addressName, setAddressName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('Punjab');
  const [addressZip, setAddressZip] = useState('');

  // Settings
  const [smsPromo, setSmsPromo] = useState(true);
  const [emailPromo, setEmailPromo] = useState(true);

  // Affiliate registration forms local states
  const [payoutMethod, setPayoutMethod] = useState('EasyPaisa');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [isRegisteringAff, setIsRegisteringAff] = useState(false);

  // Affiliate cashout forms local states
  const [cashoutAmount, setCashoutAmount] = useState('');
  const [cashoutMethod, setCashoutMethod] = useState('EasyPaisa');
  const [cashoutDetails, setCashoutDetails] = useState('');
  const [cashoutSuccess, setCashoutSuccess] = useState('');
  const [cashoutError, setCashoutError] = useState('');
  const [isSubmittingCashout, setIsSubmittingCashout] = useState(false);

  // Copy code click state
  const [copiedLink, setCopiedLink] = useState(false);

  React.useEffect(() => {
    if (currentAffiliate) {
      if (currentAffiliate.paymentMethod) setPayoutMethod(currentAffiliate.paymentMethod);
      if (currentAffiliate.paymentDetails) setPayoutDetails(currentAffiliate.paymentDetails);
    }
  }, [currentAffiliate?.paymentMethod, currentAffiliate?.paymentDetails]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6" id="dashboard-not-auth">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-xl mx-auto shadow-inner">
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Authentication Required</h2>
          <p className="text-sm text-gray-500">You must be logged in to access your personal dashboard, track shipments, and configure settings.</p>
        </div>
        <button
          onClick={() => setCurrentView('auth')}
          className="bg-[#0F9D58] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  // Filter products that are in the user's wishlist
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  // Handle Profile Update
  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(fullName, phone, currentUser.addresses || []);
  };

  // Add Address
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressName || !addressLine || !addressCity) return;

    const freshAddress = {
      id: `addr-${Date.now()}`,
      title: addressTitle,
      fullName: addressName,
      phone: addressPhone,
      addressLine,
      city: addressCity,
      state: addressState,
      zipCode: addressZip
    };

    const currentAddresses = currentUser.addresses || [];
    updateProfile(currentUser.fullName, currentUser.phone || '', [...currentAddresses, freshAddress]);
    
    // Reset Form
    setShowAddressForm(false);
    setAddressName('');
    setAddressPhone('');
    setAddressLine('');
    setAddressCity('');
    setAddressZip('');
  };

  // Delete Address
  const handleDeleteAddress = (addrId: string) => {
    const currentAddresses = currentUser.addresses || [];
    const filtered = currentAddresses.filter(a => a.id !== addrId);
    updateProfile(currentUser.fullName, currentUser.phone || '', filtered);
  };

  // Order status progress checker array
  const orderStages = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const getStageIndex = (status: string) => {
    if (status === 'Cancelled') return -1;
    return orderStages.indexOf(status);
  };

  return (
    <div className="w-full pb-16 animate-in fade-in duration-300" id="user-dashboard-container">
      
      {/* Dashboard Grid split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDEBAR: NAVIGATION PANEL */}
        <aside className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-6 text-left">
          
          {/* User profile capsule details */}
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-50 dark:border-zinc-800/50">
            <div className="w-11 h-11 rounded-2xl bg-[#0F9D58] text-white flex items-center justify-center font-black text-lg shadow-md">
              {currentUser.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-sm truncate">{currentUser.fullName}</h3>
              <p className="text-[11px] text-gray-400 truncate">{currentUser.email}</p>
            </div>
          </div>

          {/* Nav list options */}
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-colors ${
                activeTab === 'profile' 
                  ? 'bg-emerald-50 dark:bg-zinc-800 text-[#0F9D58]' 
                  : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
              }`}
            >
              <User size={16} />
              <span>Personal Details</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-colors ${
                activeTab === 'orders' 
                  ? 'bg-emerald-50 dark:bg-zinc-800 text-[#0F9D58]' 
                  : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
              }`}
            >
              <ClipboardList size={16} />
              <span>My Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-colors ${
                activeTab === 'wishlist' 
                  ? 'bg-emerald-50 dark:bg-zinc-800 text-[#0F9D58]' 
                  : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
              }`}
            >
              <Heart size={16} />
              <span>Wishlist ({wishlist.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-colors ${
                activeTab === 'addresses' 
                  ? 'bg-emerald-50 dark:bg-zinc-800 text-[#0F9D58]' 
                  : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
              }`}
            >
              <MapPin size={16} />
              <span>Saved Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-colors ${
                activeTab === 'notifications' 
                  ? 'bg-emerald-50 dark:bg-zinc-800 text-[#0F9D58]' 
                  : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
              }`}
            >
              <Bell size={16} />
              <span>Notifications ({notifications.filter(n=>!n.read).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-3 transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-emerald-50 dark:bg-zinc-800 text-[#0F9D58]' 
                  : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
              }`}
            >
              <Settings size={16} />
              <span>Account Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('affiliate')}
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors ${
                activeTab === 'affiliate' 
                  ? 'bg-emerald-50 dark:bg-zinc-800 text-[#0F9D58]' 
                  : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Coins size={16} />
                <span>Affiliate Program</span>
              </div>
              {(currentAffiliate || currentAffiliateApplication) && (
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  (currentAffiliate?.status === 'active' || currentAffiliateApplication?.status === 'Approved')
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : (currentAffiliate?.status === 'rejected' || currentAffiliateApplication?.status === 'Rejected')
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {currentAffiliate?.status === 'active' || currentAffiliateApplication?.status === 'Approved' ? 'Active' : (currentAffiliate?.status === 'rejected' || currentAffiliateApplication?.status === 'Rejected') ? 'Rejected' : 'Review'}
                </span>
              )}
            </button>

            <div className="pt-4 border-t border-gray-50 dark:border-zinc-800">
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl flex items-center space-x-3 transition-colors"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* DETAILS CONTAINER: TAB VIEW CONTENT */}
        <main className="lg:col-span-9 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[32px] p-6 sm:p-8 shadow-sm min-h-[500px]">
          
          {/* TAB 1: Profile View */}
          {activeTab === 'profile' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Profile Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">Manage your personal details and contact numbers</p>
              </div>

              <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">Email Address (Locked)</label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full bg-gray-100 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">Contact Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-6 bg-[#0F9D58] hover:bg-[#0B7B44] text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-colors"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Orders Tracking view */}
          {activeTab === 'orders' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Order Tracking</h2>
                <p className="text-xs text-gray-400 mt-0.5">Real-time status tracking for shipments across Pakistan</p>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center max-w-sm mx-auto space-y-4">
                  <p className="text-gray-400 text-sm">You haven't placed any orders yet.</p>
                  <button 
                    onClick={() => setCurrentView('products')} 
                    className="bg-[#0F9D58] text-white font-bold text-xs px-5 py-2 rounded-xl"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {orders.map((order, orderIdx) => {
                    const currentStageIndex = getStageIndex(order.status);
                    
                    return (
                      <div 
                        key={order.id ? `${order.id}-${orderIdx}` : `order-${orderIdx}`} 
                        className="border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6 bg-gray-50/30 dark:bg-zinc-950/10"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5 text-xs">
                          <div>
                            <span className="text-gray-400 font-semibold uppercase tracking-wider block">Reference Code</span>
                            <span className="font-extrabold text-gray-900 dark:text-white font-mono text-sm">{order.id}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-semibold uppercase tracking-wider block">Estimated Date</span>
                            <span className="font-bold text-gray-800 dark:text-white">{order.date}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-semibold uppercase tracking-wider block">Amount</span>
                            <span className="font-black text-[#0F9D58] text-sm">Rs. {order.total.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-semibold uppercase tracking-wider block">Active Status</span>
                            <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              order.status === 'Delivered' 
                                ? 'bg-green-500/10 text-green-500' 
                                : order.status === 'Cancelled' 
                                ? 'bg-red-500/10 text-red-500' 
                                : 'bg-yellow-500/10 text-yellow-500'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* HIGH FIDELITY SHIPMENT PROGRESS TRACKER */}
                        {order.status !== 'Cancelled' && (
                          <div className="space-y-4">
                            <h4 className="text-[11px] text-gray-400 font-black uppercase tracking-widest">Real-Time Shipment Progress</h4>
                            
                            {/* Horizontal visual tracking bar */}
                            <div className="relative pt-2">
                              {/* Background Line */}
                              <div className="absolute top-5 left-4 right-4 h-1 bg-gray-100 dark:bg-zinc-800 -translate-y-1/2 z-0 rounded" />
                              {/* Colored Progress Line */}
                              <div 
                                className="absolute top-5 left-4 h-1 bg-[#0F9D58] -translate-y-1/2 z-0 rounded transition-all duration-500" 
                                style={{ 
                                  width: `${(currentStageIndex / (orderStages.length - 1)) * 96}%` 
                                }}
                              />

                              {/* Stages Nodes */}
                              <div className="relative z-10 flex justify-between items-center text-center">
                                {orderStages.map((stage, sIdx) => {
                                  const isActive = sIdx <= currentStageIndex;
                                  const isCurrent = sIdx === currentStageIndex;
                                  
                                  return (
                                    <div key={`${stage}-${sIdx}`} className="flex flex-col items-center max-w-[80px]">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all border-2 ${
                                        isCurrent 
                                          ? 'bg-[#0F9D58] border-[#0F9D58] text-white shadow' 
                                          : isActive 
                                          ? 'bg-green-100 border-[#0F9D58] text-[#0F9D58] dark:bg-zinc-800' 
                                          : 'bg-white border-gray-100 text-gray-300 dark:bg-zinc-900 dark:border-zinc-800'
                                      }`}>
                                        {isActive ? <CheckCircle2 size={12} /> : <span className="text-[10px] font-bold">{sIdx + 1}</span>}
                                      </div>
                                      <span className={`text-[10px] font-bold mt-1.5 ${
                                        isCurrent ? 'text-[#0F9D58]' : isActive ? 'text-gray-800 dark:text-zinc-300' : 'text-gray-400'
                                      }`}>
                                        {stage}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Order Items list review */}
                        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/50 space-y-1 text-xs text-gray-500">
                          <p className="font-bold text-gray-400">Order Items Details:</p>
                          {order.items.map((item, itemIdx) => (
                            <div key={`${item.product.id}-${itemIdx}`} className="flex justify-between">
                              <span>{item.product.name} (x{item.quantity})</span>
                              <span className="font-semibold text-gray-800 dark:text-zinc-300">Rs. {(item.product.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Wishlist Grid Display */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Your Wishlist</h2>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">Items you saved for future purchases</p>
              </div>

              {wishlistProducts.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm italic">
                  Your wishlist is empty. Tap the heart icons on product cards to save items!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlistProducts.map((p, pIdx) => (
                    <ProductCard key={p.id ? `${p.id}-${pIdx}` : `wish-${pIdx}`} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Saved Addresses</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Manage delivery coordinates for quicker checkout</p>
                </div>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="bg-[#0F9D58] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1 shadow cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Add address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-gray-50 dark:bg-zinc-950/20 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-3 duration-150 max-w-lg">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Configure Delivery Coordinates</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">Address Title label</label>
                      <div className="flex space-x-2">
                        {['Home', 'Office', 'Other'].map((t, tIdx) => (
                          <button
                            key={`${t}-${tIdx}`}
                            type="button"
                            onClick={() => setAddressTitle(t)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                              addressTitle === t ? 'bg-[#0F9D58] border-[#0F9D58] text-white' : 'border-gray-200 dark:border-zinc-800 text-gray-500'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Asad"
                        value={addressName}
                        onChange={(e) => setAddressName(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">Phone</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 0300-1234567"
                        value={addressPhone}
                        onChange={(e) => setAddressPhone(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">Street Address</label>
                      <input
                        type="text"
                        required
                        placeholder="House No, Street Name, Block..."
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">City</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lahore"
                        value={addressCity}
                        onChange={(e) => setAddressCity(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold block">State / Province</label>
                      <select
                        value={addressState}
                        onChange={(e) => setAddressState(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-white focus:outline-none"
                      >
                        <option value="Federal Capital">Federal Capital</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Sindh">Sindh</option>
                        <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                        <option value="Balochistan">Balochistan</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-[#0F9D58] text-white rounded-xl text-xs font-bold shadow"
                    >
                      Save Address Coordinates
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {currentUser.addresses && currentUser.addresses.length === 0 ? (
                  <p className="text-gray-400 text-xs italic">No saved addresses. Click Add New above to configure.</p>
                ) : (
                  currentUser.addresses?.map((addr, aIdx) => (
                    <div 
                      key={addr.id ? `${addr.id}-${aIdx}` : `addr-${aIdx}`} 
                      className="border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 space-y-2 text-xs relative text-left bg-gray-50/50 dark:bg-zinc-950/20"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-[#0F9D58] uppercase tracking-wider text-[10px] bg-[#0F9D58]/10 px-2 py-0.5 rounded-md">
                          {addr.title}
                        </span>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Delete address"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{addr.fullName}</p>
                      <p className="text-gray-500">{addr.addressLine}, {addr.city}</p>
                      <p className="text-gray-400 font-mono">Phone: {addr.phone}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Notifications center */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Inbox Notifications</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Alerts from e-commerce checkouts and promotional codes</p>
                </div>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-gray-400 text-xs italic py-6">Your inbox is clear! No active notifications.</p>
                ) : (
                  notifications.map((n, nIdx) => (
                    <div 
                      key={n.id ? `${n.id}-${nIdx}` : `notif-${nIdx}`} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-4 border border-gray-100 dark:border-zinc-800 rounded-2xl flex items-start space-x-3 text-xs cursor-pointer transition-colors ${
                        !n.read ? 'bg-green-50/20 dark:bg-[#0F9D58]/5' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${
                        n.type === 'success' ? 'bg-green-50 text-green-500' : n.type === 'warning' ? 'bg-yellow-50 text-yellow-500' : 'bg-blue-50 text-blue-500'
                      }`}>
                        <Bell size={16} />
                      </div>
                      <div className="flex-1 text-left space-y-0.5">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm">{n.title}</h4>
                          <span className="text-[10px] text-gray-400 font-mono">{n.date}</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Settings panel */}
          {activeTab === 'settings' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Account Settings</h2>
                <p className="text-xs text-gray-400 mt-0.5">Configure notification subscriptions and preferences</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="p-4 bg-gray-50 dark:bg-zinc-950/20 border border-gray-100 dark:border-zinc-800 rounded-2xl space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Communication Preferences</h3>
                  
                  <label className="flex items-center justify-between text-xs cursor-pointer">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-zinc-300">Promotional Email Newsletters</p>
                      <p className="text-gray-400 font-medium">Receive weekly custom promo codes and discounts.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailPromo}
                      onChange={() => setEmailPromo(!emailPromo)}
                      className="rounded text-[#0F9D58] focus:ring-[#0F9D58] border-gray-300 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs cursor-pointer">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-zinc-300">SMS Verification & Order Alerts</p>
                      <p className="text-gray-400 font-medium">Receive real-time carrier delivery progress alerts.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsPromo}
                      onChange={() => setSmsPromo(!smsPromo)}
                      className="rounded text-[#0F9D58] focus:ring-[#0F9D58] border-gray-300 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100/50 dark:border-zinc-800 flex items-start space-x-2.5 text-xs text-zinc-500">
                  <ShieldCheck size={18} className="text-[#0F9D58] shrink-0 mt-0.5" />
                  <span>Privacy Pledge: Pak-Tajarat coordinates are fully encrypted. We strictly do not sell consumer statistics to data aggregators.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: AFFILIATE PARTNER PROGRAM */}
          {activeTab === 'affiliate' && (() => {
            const isApproved = currentAffiliateApplication?.status === 'Approved' || currentAffiliate?.status === 'active';
            const aff = currentAffiliate || {
              id: currentUser?.id || '',
              userId: currentUser?.id || '',
              referralCode: currentAffiliateApplication?.uid 
                ? `PAK-${currentAffiliateApplication.fullName.slice(0, 3).toUpperCase()}-${currentAffiliateApplication.uid.slice(-4).toUpperCase()}` 
                : 'PAK-PARTNER',
              totalClicks: 0,
              totalReferrals: 0,
              totalEarnings: 0,
              pendingCommission: 0,
              paidCommission: 0,
              status: 'active' as const,
              paymentMethod: 'EasyPaisa',
              paymentDetails: currentAffiliateApplication?.mobileNumber || '',
              createdAt: ''
            };

            return (
              <div className="space-y-8 text-left animate-in fade-in duration-300">
                
                {/* Header Section */}
                <div className="border-b border-gray-100 dark:border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Coins className="text-[#0F9D58] animate-pulse" size={24} />
                      <span>Affiliate Partner Dashboard</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Earn generous commissions by recommending Pakistan's premier online marketplace.</p>
                  </div>
                  {isApproved && (
                    <div className="flex items-center gap-2 self-start sm:self-auto bg-[#0F9D58]/10 text-[#0F9D58] px-3.5 py-1.5 rounded-full border border-[#0F9D58]/20 shadow-sm">
                      <Award size={14} className="text-[#0F9D58]" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Commission Level:</span>
                      <span className="text-xs font-black">{commissionRate}%</span>
                    </div>
                  )}
                </div>

                {/* IF NOT APPROVED, RENDER STATUS/APPLICATION ENROLLMENT */}
                {!isApproved ? (
                  <AffiliateApplicationStatus />
                ) : (
                  /* STYLISH ACTIVE DASHBOARD CONTAINER */
                  <div className="space-y-8 animate-in fade-in duration-500">
                    
                    {/* Premium Welcome Banner */}
                    <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden">
                      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-52 h-52 bg-teal-500/20 rounded-full blur-3xl" />
                      
                      <div className="relative z-10 space-y-4 max-w-xl text-left">
                        <span className="bg-white/20 text-white font-extrabold text-[9px] px-3 py-1 rounded-full border border-white/20 uppercase tracking-widest inline-flex items-center gap-1">
                          <Sparkles size={10} className="animate-spin" />
                          <span>Premium Affiliate Member</span>
                        </span>
                        
                        <h3 className="text-2xl font-black leading-tight tracking-tight">
                          Welcome to the Pak-Tajarat Circle, {currentUser?.fullName || 'Partner'}!
                        </h3>
                        
                        <p className="text-xs text-white/90 leading-relaxed font-medium">
                          You are fully set up to make money by sharing. Each person buying via your custom link earns you <span className="font-bold underline">{commissionRate}% on the entire basket!</span>
                        </p>

                        <div className="pt-2">
                          <button
                            onClick={() => setCurrentView('affiliate-portal')}
                            className="bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-transform duration-300 hover:scale-105"
                          >
                            <span>Open Professional Affiliate Studio</span>
                            <ChevronRight size={14} className="stroke-[3px]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status Alert (In case state sync shows pending/inactive) */}
                    {aff.status === 'pending_approval' && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 p-4 rounded-2xl text-xs flex items-start space-x-3 shadow-sm">
                        <ShieldAlert size={18} className="shrink-0 mt-0.5 text-amber-500 animate-pulse" />
                        <div>
                          <span className="font-extrabold block mb-0.5">Activation Pending final confirmation</span>
                          Our backend system is preparing your payout records. You are fully authorized to share your referral coordinates right away!
                        </div>
                      </div>
                    )}

                    {aff.status === 'inactive' && (
                      <div className="bg-red-50 dark:bg-zinc-950 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 p-4 rounded-2xl text-xs flex items-start space-x-3 shadow-sm">
                        <ShieldAlert size={18} className="shrink-0 mt-0.5 text-red-500" />
                        <div>
                          <span className="font-extrabold block mb-0.5">Account Suspended</span>
                          Your affiliate account is currently inactive. Please reach out to Pak-Tajarat partner support to restore your privileges.
                        </div>
                      </div>
                    )}

                    {/* Earnings Statistics Bento Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      
                      {/* Stat 1: Clicks */}
                      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-5 rounded-2xl text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-500 flex items-center justify-center mx-auto mb-3 border border-blue-100/30 dark:border-blue-900/30">
                          <Share2 size={16} />
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-extrabold block uppercase tracking-widest">Total Clicks</span>
                          <span className="font-black text-2xl text-gray-900 dark:text-white font-mono mt-1 block">{aff.totalClicks}</span>
                        </div>
                      </div>

                      {/* Stat 2: Referrals */}
                      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-5 rounded-2xl text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 flex items-center justify-center mx-auto mb-3 border border-indigo-100/30 dark:border-indigo-900/30">
                          <Users size={16} />
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-extrabold block uppercase tracking-widest">Sales Referred</span>
                          <span className="font-black text-2xl text-gray-900 dark:text-white font-mono mt-1 block">{aff.totalReferrals}</span>
                        </div>
                      </div>

                      {/* Stat 3: Total Earnings */}
                      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-5 rounded-2xl text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 col-span-2 md:col-span-1 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-[#0F9D58] flex items-center justify-center mx-auto mb-3 border border-emerald-100/30 dark:border-emerald-900/30">
                          <TrendingUp size={16} />
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-extrabold block uppercase tracking-widest">Total Earned</span>
                          <span className="font-black text-xl text-[#0F9D58] font-mono mt-1 block">Rs. {aff.totalEarnings.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Stat 4: Pending commission */}
                      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-5 rounded-2xl text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center mx-auto mb-3 border border-amber-100/30 dark:border-amber-900/30">
                          <DollarSign size={16} />
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-extrabold block uppercase tracking-widest">Pending Payout</span>
                          <span className="font-black text-xl text-amber-500 font-mono mt-1 block">Rs. {aff.pendingCommission.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Stat 5: Paid out */}
                      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-5 rounded-2xl text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 flex items-center justify-center mx-auto mb-3 border border-teal-100/30 dark:border-teal-900/30">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-extrabold block uppercase tracking-widest">Paid Out</span>
                          <span className="font-black text-xl text-teal-600 dark:text-teal-400 font-mono mt-1 block">Rs. {aff.paidCommission.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Custom Referral Link Copy Hub */}
                    <div className="border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm relative overflow-hidden text-left">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0F9D58]" />
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-widest">Your Unique Referral Credentials</h3>
                          <p className="text-[11px] text-gray-400 mt-0.5">Share this special link. When people use it, their purchases will attribute to your payout balance.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="md:col-span-4 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-2xl px-4 py-3 text-center md:text-left">
                            <span className="text-gray-400 block font-extrabold text-[9px] uppercase tracking-wider">Referral Code</span>
                            <span className="font-black text-gray-900 dark:text-white font-mono text-sm tracking-wider">{aff.referralCode}</span>
                          </div>
                          
                          <div className="md:col-span-8 flex bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-2xl p-1 items-center gap-1">
                            <input
                              type="text"
                              readOnly
                              value={window.location.origin + '/?ref=' + aff.referralCode}
                              className="bg-transparent text-xs text-gray-600 dark:text-zinc-300 font-mono px-3.5 flex-1 select-all outline-none truncate"
                            />
                            <button
                              onClick={() => {
                                const link = window.location.origin + '/?ref=' + aff.referralCode;
                                navigator.clipboard.writeText(link);
                                setCopiedLink(true);
                                setTimeout(() => setCopiedLink(false), 2000);
                              }}
                              className={`px-5 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all duration-300 flex items-center space-x-1.5 shrink-0 ${
                                copiedLink 
                                  ? 'bg-[#0F9D58] text-white shadow-md shadow-[#0F9D58]/10' 
                                  : 'bg-[#0F9D58]/10 text-[#0F9D58] hover:bg-[#0F9D58]/20'
                              }`}
                            >
                              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                              <span>{copiedLink ? 'Copied' : 'Copy link'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lower Sections Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left: Request Payout */}
                      <div className="lg:col-span-5 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-5 shadow-sm text-left">
                        <div className="border-b border-gray-50 dark:border-zinc-800/60 pb-3 flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                            <Coins size={16} />
                          </div>
                          <span className="font-extrabold text-sm text-gray-900 dark:text-white">Request Commission Cashout</span>
                        </div>

                        {cashoutError && (
                          <div className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/20">
                            {cashoutError}
                          </div>
                        )}
                        {cashoutSuccess && (
                          <div className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/20 p-3 rounded-xl border border-green-100 dark:border-green-900/20">
                            {cashoutSuccess}
                          </div>
                        )}

                        <form 
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setCashoutSuccess('');
                            setCashoutError('');
                            const amt = parseFloat(cashoutAmount);
                            if (isNaN(amt) || amt <= 0) {
                              setCashoutError('Please input a valid positive amount.');
                              return;
                            }
                            setIsSubmittingCashout(true);
                            const result = await submitWithdrawalRequest(amt, cashoutMethod, cashoutDetails);
                            setIsSubmittingCashout(false);
                            if (result.success) {
                              setCashoutSuccess(`Withdrawal request of Rs. ${amt.toLocaleString()} has been queued!`);
                              setCashoutAmount('');
                              setCashoutDetails('');
                            } else {
                              setCashoutError(result.message);
                            }
                          }} 
                          className="space-y-4 text-xs text-left"
                        >
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Withdrawal Amount (Min Rs. 1,000)</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-gray-400 text-sm">Rs.</span>
                              <input
                                type="number"
                                required
                                placeholder="e.g. 2500"
                                value={cashoutAmount}
                                onChange={(e) => setCashoutAmount(e.target.value)}
                                className="w-full bg-gray-50/50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]/30 font-medium font-mono"
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 block font-medium">Available balance: <span className="font-extrabold font-mono text-gray-700 dark:text-zinc-300">Rs. {aff.pendingCommission.toLocaleString()}</span></span>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Payout Channel</label>
                            <select
                              value={cashoutMethod}
                              onChange={(e) => setCashoutMethod(e.target.value)}
                              className="w-full bg-gray-50/50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]/30 font-semibold"
                            >
                              <option value="EasyPaisa">EasyPaisa Mobile</option>
                              <option value="JazzCash">JazzCash Wallet</option>
                              <option value="Bank Transfer">Bank Wire Transfer</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Payout Target Details</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 0312-3456789 (Title Account)"
                              value={cashoutDetails}
                              onChange={(e) => setCashoutDetails(e.target.value)}
                              className="w-full bg-gray-50/50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]/30 font-medium"
                            />
                            <span className="text-[9px] text-gray-400 block font-medium">Specify phone, account number & name verified title.</span>
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingCashout || aff.status !== 'active'}
                            className="w-full py-3 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-extrabold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-300 cursor-pointer text-xs uppercase tracking-wider"
                          >
                            {isSubmittingCashout ? 'Processing Request...' : 'Submit Cashout Request'}
                          </button>
                        </form>
                      </div>

                      {/* Right: History logs & Referrals */}
                      <div className="lg:col-span-7 space-y-6">
                        
                        {/* Referred Conversions */}
                        <div className="border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm text-left">
                          <div className="border-b border-gray-50 dark:border-zinc-800/60 pb-3 flex items-center space-x-2">
                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                              <Users size={16} />
                            </div>
                            <span className="font-extrabold text-sm text-gray-900 dark:text-white">Referred Conversion Log ({affiliateReferrals.length})</span>
                          </div>
                          
                          <div className="mt-4 divide-y divide-gray-50 dark:divide-zinc-800/40 max-h-[220px] overflow-y-auto pr-2 space-y-1">
                            {affiliateReferrals.length === 0 ? (
                              <p className="text-gray-400 text-xs italic py-8 text-center">No referral conversions registered on this link yet.</p>
                            ) : (
                              affiliateReferrals.map((tx, tIdx) => (
                                <div key={tx.id ? `${tx.id}-${tIdx}` : `tx-${tIdx}`} className="py-3 flex justify-between items-center text-xs hover:bg-gray-50/50 dark:hover:bg-zinc-950/20 px-2 rounded-xl transition-colors">
                                  <div className="text-left space-y-0.5">
                                    <span className="font-extrabold text-gray-900 dark:text-white block font-mono text-[11px]">Tx: {tx.id.slice(0, 12)}...</span>
                                    <span className="text-[10px] text-gray-400 block font-medium">{tx.date} • Link conversion</span>
                                  </div>
                                  <div className="text-right space-y-1">
                                    <span className="font-black text-[#0F9D58] block font-mono text-sm">+Rs. {tx.commissionAmount?.toLocaleString()}</span>
                                    <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                                      tx.status === 'paid' 
                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                                        : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    }`}>{tx.status}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Cashout withdrawals requested */}
                        <div className="border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm text-left">
                          <div className="border-b border-gray-50 dark:border-zinc-800/60 pb-3 flex items-center space-x-2">
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                              <Coins size={16} />
                            </div>
                            <span className="font-extrabold text-sm text-gray-900 dark:text-white">Cashout Withdrawal Log ({affiliateWithdrawals.length})</span>
                          </div>
                          
                          <div className="mt-4 divide-y divide-gray-50 dark:divide-zinc-800/40 max-h-[220px] overflow-y-auto pr-2 space-y-1">
                            {affiliateWithdrawals.length === 0 ? (
                              <p className="text-gray-400 text-xs italic py-8 text-center">No requested payout history detected.</p>
                            ) : (
                              affiliateWithdrawals.map((withd, wIdx) => (
                                <div key={withd.id ? `${withd.id}-${wIdx}` : `withd-${wIdx}`} className="py-3 flex justify-between items-center text-xs hover:bg-gray-50/50 dark:hover:bg-zinc-950/20 px-2 rounded-xl transition-colors">
                                  <div className="text-left space-y-0.5">
                                    <span className="font-extrabold text-gray-900 dark:text-white block font-mono text-[11px]">Request ID: #{withd.id.slice(-6).toUpperCase()}</span>
                                    <span className="text-[10px] text-gray-400 block font-medium">{withd.date} • via {withd.paymentMethod}</span>
                                  </div>
                                  <div className="text-right space-y-1">
                                    <span className="font-black text-gray-900 dark:text-white block font-mono">Rs. {withd.amount.toLocaleString()}</span>
                                    <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                                      withd.status === 'approved' 
                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                                        : withd.status === 'rejected' 
                                        ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                                        : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    }`}>{withd.status}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                )}
              </div>
            );
          })()}

        </main>
      </div>

    </div>
  );
};
