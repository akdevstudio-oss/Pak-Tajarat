import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, Minus, ArrowLeft, Ticket, Check, X, ShieldCheck } from 'lucide-react';

export const CartView: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    activeCoupon,
    applyCoupon,
    removeCoupon,
    cartTotals,
    setCurrentView
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponCode.trim()) return;

    const res = applyCoupon(couponCode);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponCode('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess('');
  };

  if (cart.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-6 animate-in fade-in duration-200" id="empty-cart-view">
        <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-950 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
          🛒
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Your Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            You haven't added any premium items to your Pak-Tajarat shopping cart yet. Start exploring our verified collections.
          </p>
        </div>
        <button
          onClick={() => setCurrentView('products')}
          className="bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-bold text-sm px-8 py-3 rounded-full shadow-md transition-all cursor-pointer inline-flex items-center space-x-1.5"
        >
          <ArrowLeft size={16} />
          <span>Browse All Products</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-16 animate-in fade-in duration-300" id="cart-view-container">
      
      {/* View Header */}
      <div className="text-left mb-8">
        <span className="text-xs font-black uppercase text-[#0F9D58] tracking-widest">My Selection</span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-1">
          Your Shopping Cart
        </h1>
        <p className="text-xs text-gray-500 mt-1">Review your selected items and configure discounts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart items table list */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 divide-y divide-gray-100 dark:divide-zinc-800">
            {cart.map((item, index) => (
              <div 
                key={`${item.product.id}-${index}`} 
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${index > 0 ? 'pt-4' : ''}`}
              >
                {/* Product Core details */}
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <img
                    src={item.product.image || undefined}
                    alt={item.product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border border-gray-100 dark:border-zinc-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 text-left">
                    <span className="text-[10px] font-extrabold uppercase text-[#0F9D58] tracking-wider block">
                      {item.product.category}
                    </span>
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm sm:text-base truncate hover:text-[#0F9D58] cursor-pointer">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Unit price: Rs. {item.product.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Pricing & quantity selector controls */}
                <div className="flex sm:flex-row justify-between sm:items-center w-full sm:w-auto gap-4">
                  
                  {/* Quantity adjustment */}
                  <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-950/20">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3.5 text-xs font-bold text-gray-800 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Calculated Subtotal per Item Group */}
                  <div className="text-right sm:min-w-[100px]">
                    <p className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors shrink-0"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              </div>
            ))}
          </div>

          {/* Quick shop back navigation */}
          <button
            onClick={() => setCurrentView('products')}
            className="text-sm font-bold text-gray-500 hover:text-[#0F9D58] flex items-center space-x-1.5"
          >
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Right Column: Coupon & Order Totals summary */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* Coupon Promo Block */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-sm uppercase tracking-wider flex items-center space-x-2">
              <Ticket size={16} className="text-[#0F9D58]" />
              <span>Promo Coupon Code</span>
            </h3>

            {activeCoupon ? (
              <div className="bg-emerald-50 dark:bg-[#0F9D58]/10 text-[#0F9D58] p-3.5 rounded-2xl flex items-center justify-between border border-emerald-100/50 dark:border-[#0F9D58]/25 animate-in zoom-in-95 duration-100">
                <div className="flex items-center space-x-2">
                  <Check size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold">
                    Coupon <strong className="font-mono">{activeCoupon.code}</strong> Applied! (-
                    {activeCoupon.discountType === 'percentage' 
                      ? `${activeCoupon.discountValue}%` 
                      : `Rs. ${activeCoupon.discountValue}`}
                    )
                  </span>
                </div>
                <button onClick={handleRemoveCoupon} className="text-zinc-400 hover:text-red-500">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. PAK20 or TAJARAT500"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58]"
                />
                <button
                  type="submit"
                  className="bg-[#0F9D58] hover:bg-[#0B7B44] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && <p className="text-[11px] text-red-500 font-bold">{couponError}</p>}
            {couponSuccess && <p className="text-[11px] text-emerald-500 font-bold">{couponSuccess}</p>}
          </div>

          {/* Order Summary Calculations Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-sm uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-zinc-800">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-bold text-gray-900 dark:text-white">Rs. {cartTotals.subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Shipping Delivery:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {cartTotals.shipping === 0 
                    ? <span className="text-[#0F9D58] font-black">FREE SHIPPING</span> 
                    : `Rs. ${cartTotals.shipping.toLocaleString()}`}
                </span>
              </div>

              {cartTotals.discount > 0 && (
                <div className="flex justify-between text-red-500 font-semibold">
                  <span>Discount Code deduction:</span>
                  <span>- Rs. {cartTotals.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="h-px bg-gray-100 dark:bg-zinc-800 my-2" />

              <div className="flex justify-between items-baseline pt-1">
                <span className="font-extrabold text-gray-900 dark:text-white text-base">Grand Total:</span>
                <span className="font-black text-[#0F9D58] text-xl">Rs. {cartTotals.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Check guarantees and checkout button */}
            <div className="pt-3">
              <button
                onClick={() => setCurrentView('checkout')}
                className="w-full py-4 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
              </button>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-100/50 dark:border-zinc-800 flex items-center space-x-2 text-[11px] text-zinc-500">
              <ShieldCheck size={16} className="text-[#0F9D58] shrink-0" />
              <span>Full buyer protection: items certified, secure cash delivery.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
