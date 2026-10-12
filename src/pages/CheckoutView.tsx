import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  ShoppingBag, 
  Truck, 
  Calendar, 
  CreditCard, 
  Wallet, 
  ArrowLeft, 
  Loader2, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  Printer, 
  MessageSquare, 
  AlertCircle, 
  Copy, 
  Check,
  Tag
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartTotals,
    currentUser,
    placeOrder,
    setCurrentView,
    addNotification,
    appliedCoupon,
    applyCouponCode,
    removeCouponCode
  } = useApp();

  // Operational & Verification Modal states
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [copiedRaast, setCopiedRaast] = useState(false);

  // Redirect if cart is empty and order wasn't just placed
  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      setCurrentView('cart');
    }
  }, [cart.length, orderSuccess, setCurrentView]);

  // Shipping Form States
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Punjab');
  const [zipCode, setZipCode] = useState('');

  // Billing Address States
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingFullName, setBillingFullName] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [billingAddressLine, setBillingAddressLine] = useState('');
  const [billingCity, setBillingCity] = useState('');

  // Coupon input
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<
    'Cash on Delivery' | 'JazzCash' | 'EasyPaisa' | 'Raast / Bank Transfer' | 'Debit/Credit Card'
  >('Cash on Delivery');
  
  // Wallet / Bank details states
  const [walletPhone, setWalletPhone] = useState(currentUser?.phone || '');
  const [cnicLast4, setCnicLast4] = useState('');
  const [bankTxRef, setBankTxRef] = useState('');
  
  // Card mock states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Pre-fill address if user has saved addresses
  useEffect(() => {
    if (currentUser?.addresses && currentUser.addresses.length > 0) {
      const defaultAddr = currentUser.addresses[0];
      setFullName(defaultAddr.fullName || currentUser.fullName);
      setPhone(defaultAddr.phone || currentUser.phone);
      setAddressLine(defaultAddr.addressLine);
      setCity(defaultAddr.city);
      setState(defaultAddr.state || 'Punjab');
      setZipCode(defaultAddr.zipCode || '44000');
    }
  }, [currentUser?.id]);

  // Apply Coupon Handler
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    const res = applyCouponCode(couponInput.trim().toUpperCase());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const copyRaastDetails = () => {
    navigator.clipboard.writeText('PK78MEEZ000123456789001');
    setCopiedRaast(true);
    setTimeout(() => setCopiedRaast(false), 2000);
    addNotification('Raast IBAN Copied', 'Meezan Bank Raast IBAN copied to clipboard.', 'info');
  };

  const handleInitiateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !addressLine || !city) {
      addNotification('Missing Information', 'Please complete all required shipping address fields.', 'warning');
      return;
    }

    // Validation for online payments
    if (paymentMethod === 'JazzCash' || paymentMethod === 'EasyPaisa') {
      if (!walletPhone || walletPhone.length < 11) {
        addNotification('Invalid Mobile Account', 'Please enter a valid 11-digit mobile wallet number.', 'warning');
        return;
      }
      setShowOtpModal(true);
      return;
    }

    if (paymentMethod === 'Debit/Credit Card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        addNotification('Incomplete Card Information', 'Please enter valid debit/credit card details.', 'warning');
        return;
      }
      setShowOtpModal(true);
      return;
    }

    if (paymentMethod === 'Raast / Bank Transfer') {
      if (!bankTxRef.trim()) {
        addNotification('Missing Transaction Reference', 'Please enter the 12-digit Raast/Bank Transaction Reference ID after transfer.', 'warning');
        return;
      }
    }

    executeOrderPlacement();
  };

  const executeOrderPlacement = () => {
    setIsPlacingOrder(true);
    setShowOtpModal(false);

    setTimeout(async () => {
      const shippingAddress = {
        fullName,
        phone,
        addressLine,
        city,
        state,
        zipCode
      };

      const billingAddress = sameAsShipping ? shippingAddress : {
        fullName: billingFullName || fullName,
        phone: billingPhone || phone,
        addressLine: billingAddressLine || addressLine,
        city: billingCity || city,
        state,
        zipCode
      };

      const formattedPaymentMethod = paymentMethod === 'Raast / Bank Transfer' 
        ? `Raast Direct (Tx: ${bankTxRef})` 
        : paymentMethod;

      const res = await placeOrder(formattedPaymentMethod, shippingAddress, billingAddress);
      
      setIsPlacingOrder(false);
      if (res.success && res.order) {
        setOrderSuccess(true);
        setPlacedOrderDetails(res.order);
      }
    }, 1200);
  };

  const handleOtpVerify = () => {
    setOtpSending(true);
    setTimeout(() => {
      setOtpSending(false);
      executeOrderPlacement();
    }, 1000);
  };

  // WhatsApp link generator
  const getWhatsAppMessageUrl = () => {
    if (!placedOrderDetails) return '#';
    const text = `As-salamu alaykum! I placed an order on Pak-Tajarat.\n\n*Order ID:* ${placedOrderDetails.id}\n*Customer:* ${fullName}\n*Phone:* ${phone}\n*Total:* Rs. ${placedOrderDetails.total.toLocaleString()}\n*Payment Method:* ${placedOrderDetails.paymentMethod}\n*Shipping City:* ${city}\n\nPlease confirm shipment!`;
    return `https://wa.me/923261604808?text=${encodeURIComponent(text)}`;
  };

  // SUCCESS SCREEN
  if (orderSuccess && placedOrderDetails) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-in zoom-in-95 duration-200" id="checkout-success-screen">
        <div className="w-20 h-20 bg-[#0F9D58] text-white rounded-full flex items-center justify-center text-4xl mx-auto shadow-xl ring-8 ring-[#0F9D58]/10 animate-pulse">
          <CheckCircle2 size={48} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Order Placed Successfully! (آرڈر موصول ہو گیا ہے)
          </h1>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Shabaash! Your order reference <strong className="text-gray-800 dark:text-white font-mono">{placedOrderDetails.id}</strong> has been created. An SMS notification has been dispatched.
          </p>
        </div>

        {/* Order Status Tracker Timeline */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm text-left space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Order Fulfillment Pipeline</span>
            <span className="text-[#0F9D58] bg-[#0F9D58]/10 px-2.5 py-0.5 rounded-full text-[10px] font-black">
              {placedOrderDetails.status}
            </span>
          </h3>

          <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px] font-bold">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#0F9D58] text-white flex items-center justify-center mx-auto ring-4 ring-[#0F9D58]/20">
                <Check size={14} />
              </div>
              <p className="text-[#0F9D58]">Pending</p>
            </div>
            <div className="space-y-1 opacity-50">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-500 flex items-center justify-center mx-auto">
                2
              </div>
              <p className="text-gray-400">Processing</p>
            </div>
            <div className="space-y-1 opacity-50">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-500 flex items-center justify-center mx-auto">
                3
              </div>
              <p className="text-gray-400">Shipped</p>
            </div>
            <div className="space-y-1 opacity-50">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-500 flex items-center justify-center mx-auto">
                4
              </div>
              <p className="text-gray-400">Delivered</p>
            </div>
          </div>
        </div>

        {/* Order Details Receipt Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-md text-left space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Order Reference</p>
              <h3 className="font-extrabold text-gray-800 dark:text-white font-mono text-base">{placedOrderDetails.id}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date Placed</p>
              <p className="text-xs font-bold text-gray-800 dark:text-white">{placedOrderDetails.date}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Recipient Name:</span>
              <span className="font-bold text-gray-800 dark:text-white">{placedOrderDetails.shippingAddress.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping Address:</span>
              <span className="font-bold text-gray-800 dark:text-white text-right max-w-[220px] truncate">
                {placedOrderDetails.shippingAddress.addressLine}, {placedOrderDetails.shippingAddress.city}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Gateway:</span>
              <span className="font-bold text-[#0F9D58]">{placedOrderDetails.paymentMethod}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-zinc-800 text-sm">
              <span className="font-bold text-gray-900 dark:text-white">Amount Paid / COD:</span>
              <span className="font-black text-[#0F9D58]">Rs. {placedOrderDetails.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp & Print Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href={getWhatsAppMessageUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#1DA851] text-white font-extrabold text-xs rounded-2xl shadow flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <MessageSquare size={16} />
            <span>Confirm Order on WhatsApp</span>
          </a>

          <button
            onClick={() => window.print()}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-extrabold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Printer size={16} />
            <span>Print Invoice Receipt</span>
          </button>
        </div>

        {/* CTA triggers */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            onClick={() => setCurrentView('profile')}
            className="flex-1 py-3 px-6 bg-gray-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Track Order History
          </button>
          <button
            onClick={() => setCurrentView('products')}
            className="flex-1 py-3 px-6 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
          >
            Explore More Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-16 animate-in fade-in duration-300" id="checkout-view-container">
      
      {/* View Header */}
      <div className="text-left mb-6 flex justify-between items-end">
        <div>
          <button
            onClick={() => setCurrentView('cart')}
            className="text-xs text-gray-500 hover:text-[#0F9D58] font-bold flex items-center space-x-1 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Shopping Cart</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Checkout & Order Settlement
          </h1>
          <p className="text-xs text-gray-500 mt-1">Verify shipping address and select secure Pakistani payment method</p>
        </div>
      </div>

      <form onSubmit={handleInitiateOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Shipping & Payment Information */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Shipping Address Details */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 text-left">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base pb-3 border-b border-gray-100 dark:border-zinc-800 uppercase tracking-wider flex items-center justify-between">
              <span>1. Shipping Destination</span>
              <Truck size={18} className="text-[#0F9D58]" />
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Receiver Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Bilal"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Mobile Number (WhatsApp) *</label>
                <input
                  type="text"
                  required
                  placeholder="0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Street Address / House / Colony *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House 42, Street 8, Sector F-11/3"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore / Islamabad / Karachi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Province / Region</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58]"
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Federal Capital">Federal Capital (Islamabad)</option>
                  <option value="Gilgit Baltistan">Gilgit Baltistan</option>
                  <option value="Azad Kashmir">Azad Kashmir</option>
                </select>
              </div>
            </div>

            {/* Billing Address Toggle */}
            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                  className="rounded text-[#0F9D58] focus:ring-[#0F9D58] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                  Billing address is same as shipping address
                </span>
              </label>

              {!sameAsShipping && (
                <div className="mt-3 p-4 bg-gray-50 dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                  <input
                    type="text"
                    placeholder="Billing Full Name"
                    value={billingFullName}
                    onChange={e => setBillingFullName(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-gray-800 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Billing Phone Number"
                    value={billingPhone}
                    onChange={e => setBillingPhone(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-gray-800 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Billing Street Address"
                    value={billingAddressLine}
                    onChange={e => setBillingAddressLine(e.target.value)}
                    className="sm:col-span-2 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-gray-800 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 text-left">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base pb-3 border-b border-gray-100 dark:border-zinc-800 uppercase tracking-wider flex items-center justify-between">
              <span>2. Pakistani Payment Options</span>
              <ShieldCheck size={18} className="text-[#0F9D58]" />
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              
              {/* COD Choice */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-[#0F9D58] bg-[#0F9D58]/10 ring-2 ring-[#0F9D58]/30'
                    : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="p-2 bg-[#0F9D58]/15 text-[#0F9D58] rounded-xl shrink-0">
                  <Wallet size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">Cash on Delivery</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Pay upon package inspection</p>
                </div>
              </button>

              {/* JAZZCASH */}
              <button
                type="button"
                onClick={() => setPaymentMethod('JazzCash')}
                className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                  paymentMethod === 'JazzCash'
                    ? 'border-[#0F9D58] bg-[#0F9D58]/10 ring-2 ring-[#0F9D58]/30'
                    : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="p-2 bg-red-500/15 text-red-500 rounded-xl shrink-0 font-black text-xs">
                  JC
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">JazzCash Mobile Wallet</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Instant Mobile Account PIN</p>
                </div>
              </button>

              {/* EASYPAISA */}
              <button
                type="button"
                onClick={() => setPaymentMethod('EasyPaisa')}
                className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                  paymentMethod === 'EasyPaisa'
                    ? 'border-[#0F9D58] bg-[#0F9D58]/10 ring-2 ring-[#0F9D58]/30'
                    : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="p-2 bg-emerald-500/15 text-emerald-500 rounded-xl shrink-0 font-black text-xs">
                  EP
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">EasyPaisa Wallet</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Direct wallet push request</p>
                </div>
              </button>

              {/* RAAST / BANK */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Raast / Bank Transfer')}
                className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                  paymentMethod === 'Raast / Bank Transfer'
                    ? 'border-[#0F9D58] bg-[#0F9D58]/10 ring-2 ring-[#0F9D58]/30'
                    : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="p-2 bg-blue-500/15 text-blue-500 rounded-xl shrink-0">
                  <Building2 size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">Raast Direct / Bank</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Instant 0% Fee IBAN Transfer</p>
                </div>
              </button>

              {/* DEBIT / CREDIT CARD */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Debit/Credit Card')}
                className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                  paymentMethod === 'Debit/Credit Card'
                    ? 'border-[#0F9D58] bg-[#0F9D58]/10 ring-2 ring-[#0F9D58]/30'
                    : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="p-2 bg-purple-500/15 text-purple-500 rounded-xl shrink-0">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">Visa / MasterCard</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">International & Local Cards</p>
                </div>
              </button>

            </div>

            {/* JAZZCASH / EASYPAISA INPUTS */}
            {(paymentMethod === 'JazzCash' || paymentMethod === 'EasyPaisa') && (
              <div className="p-5 bg-zinc-950/40 border border-zinc-800 rounded-2xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                    <Smartphone size={14} />
                    <span>{paymentMethod} Wallet Checkout</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    Automated Push Request
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                      {paymentMethod} Account Mobile Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="03001234567"
                      value={walletPhone}
                      onChange={e => setWalletPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#0F9D58]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                      CNIC Last 6 Digits (Verification)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="345678"
                      value={cnicLast4}
                      onChange={e => setCnicLast4(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#0F9D58]"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">
                  After clicking Place Order, a USSD / MPIN popup will appear on your phone number ({walletPhone || '0300xxxxxxx'}) to authorize the transaction.
                </p>
              </div>
            )}

            {/* RAAST DETAILS & TX REFERENCE */}
            {paymentMethod === 'Raast / Bank Transfer' && (
              <div className="p-5 bg-zinc-950/40 border border-zinc-800 rounded-2xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-400 flex items-center space-x-1.5">
                    <Building2 size={14} />
                    <span>Pak-Tajarat Official Raast / Bank Account</span>
                  </h4>
                  <button
                    type="button"
                    onClick={copyRaastDetails}
                    className="text-[10px] bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    {copiedRaast ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedRaast ? 'Copied' : 'Copy IBAN'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-zinc-900 rounded-xl text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Bank Name</span>
                    <strong className="text-white">Meezan Bank Limited</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Account Title</span>
                    <strong className="text-white">PAK-TAJARAT ENTERPRISE</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Raast ID / Phone</span>
                    <strong className="text-emerald-400 font-mono">03261604808</strong>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                    Enter Bank Transfer Transaction Ref ID / Slip No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 982301492041"
                    value={bankTxRef}
                    onChange={e => setBankTxRef(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#0F9D58]"
                  />
                </div>
              </div>
            )}

            {/* CARD INPUTS */}
            {paymentMethod === 'Debit/Credit Card' && (
              <div className="p-5 bg-zinc-950/40 border border-zinc-800 rounded-2xl grid grid-cols-3 gap-3 animate-in fade-in duration-200">
                <div className="col-span-3 space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Debit/Credit Card Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white font-mono focus:border-[#0F9D58]"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Expiry Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white font-mono focus:border-[#0F9D58]"
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">CVV *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white font-mono focus:border-[#0F9D58]"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Order Invoice summary checkout */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-sm uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-zinc-800">
              Order Summary
            </h3>

            {/* List of checkout products */}
            <div className="max-h-52 overflow-y-auto space-y-3 pr-1">
              {cart.map((item, index) => (
                <div key={`${item.product.id}-${index}`} className="flex justify-between items-center text-xs gap-3">
                  <span className="text-gray-600 dark:text-zinc-400 truncate max-w-[180px] font-medium">
                    {item.product.name} <strong className="text-gray-400">x{item.quantity}</strong>
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">Rs. {(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Coupon Box */}
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
              {appliedCoupon ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Tag size={14} className="text-[#0F9D58]" />
                    <span className="font-bold text-[#0F9D58]">{appliedCoupon.code}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCouponCode}
                    className="text-red-500 hover:underline font-bold text-[10px] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. PAK10)"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      className="flex-1 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-white uppercase font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 py-1.5 bg-[#0F9D58] hover:bg-[#0B7B44] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                </div>
              )}
            </div>

            {/* Totals Calculation */}
            <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Cart Subtotal:</span>
                <span className="font-bold text-gray-800 dark:text-white">Rs. {cartTotals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping Delivery:</span>
                <span className="font-bold text-gray-800 dark:text-white">
                  {cartTotals.shipping === 0 ? 'FREE SHIPPING' : `Rs. ${cartTotals.shipping.toLocaleString()}`}
                </span>
              </div>
              {cartTotals.discount > 0 && (
                <div className="flex justify-between text-red-500 font-bold">
                  <span>Coupon Savings:</span>
                  <span>- Rs. {cartTotals.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-zinc-800 pt-2 flex justify-between items-baseline text-sm">
                <span className="font-extrabold text-gray-900 dark:text-white">Grand Total:</span>
                <span className="font-black text-[#0F9D58] text-base">Rs. {cartTotals.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPlacingOrder}
                className="w-full py-4 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing Payment & Order...</span>
                  </>
                ) : (
                  <span>Place Order ({paymentMethod})</span>
                )}
              </button>
            </div>
          </div>

        </div>

      </form>

      {/* OTP SIMULATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Authorize {paymentMethod} Transaction
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Enter the 4-digit MPIN sent to <span className="text-white font-mono">{walletPhone || '0300xxxxxxx'}</span> for Rs. {cartTotals.total.toLocaleString()}
              </p>
            </div>

            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={otpCode}
              onChange={e => setOtpCode(e.target.value)}
              className="w-full text-center tracking-widest text-xl font-mono bg-zinc-950 border border-zinc-800 text-white rounded-xl py-3 focus:outline-none focus:border-[#0F9D58]"
            />

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={otpSending}
                onClick={handleOtpVerify}
                className="flex-1 py-2.5 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center space-x-1"
              >
                {otpSending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <span>Confirm Payment</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

