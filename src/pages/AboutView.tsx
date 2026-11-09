import React from 'react';
import { useApp } from '../context/AppContext';
import { Truck, ShieldCheck, RotateCcw, Handshake, Globe, PackageCheck } from 'lucide-react';

export const AboutView: React.FC = () => {
  const { setCurrentView } = useApp();

  const values = [
    {
      icon: ShieldCheck,
      title: 'Cash on Delivery',
      description: 'COD is available on eligible orders. Confirm the available payment option at checkout before placing an order.'
    },
    {
      icon: Truck,
      title: 'Courier Delivery',
      description: 'Orders are dispatched through available courier partners such as TCS, Leopard, or another service suited to the destination.'
    },
    {
      icon: RotateCcw,
      title: '7-Day Return Requests',
      description: 'Contact support within 7 days of delivery, share your order details and reason, and wait for return instructions.'
    },
    {
      icon: Handshake,
      title: 'Affiliate & Reseller Program',
      description: 'Approved partners can promote available products without buying stock upfront. Commission and payout terms follow the affiliate programme.'
    }
  ];

  return (
    <div className="w-full pb-16 animate-in fade-in duration-300" id="about-container">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-black uppercase text-[#0F9D58] tracking-widest bg-[#0F9D58]/10 px-3.5 py-1.5 rounded-full">
          About Pak-Tijarat
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mt-4 leading-tight">
          Pakistan's Trusted <span className="text-[#0F9D58]">Digital Marketplace</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-4 leading-relaxed">
          Pak-Tijarat is a Pakistan-focused online store. Our product catalogue is managed through the store's administration system, so shoppers can review the current product photos, descriptions, prices and availability before ordering.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto mb-14">
        {values.map(({ icon: Icon, title, description }) => (
          <div key={title} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[28px] p-6 text-left space-y-4 shadow-sm">
            <div className="p-3 bg-[#0F9D58]/10 text-[#0F9D58] rounded-2xl w-fit">
              <Icon size={24} />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">{title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 text-zinc-100 rounded-[36px] p-8 sm:p-12 text-left max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-12">
        <div className="md:col-span-8 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            A Clearer Way to Shop Online
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            We aim to make online shopping straightforward: browse the products currently listed, check the product information and stock status, choose an available delivery and payment option, and contact support if you need help with an order.
          </p>
          <div className="pt-2 flex flex-wrap gap-3 text-xs font-bold text-zinc-300">
            <span className="bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700/50">Pakistan-focused store</span>
            <span className="bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700/50">Admin-managed catalogue</span>
            <span className="bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700/50">Customer support on WhatsApp</span>
          </div>
        </div>

        <div className="md:col-span-4 bg-zinc-800 rounded-3xl p-6 border border-zinc-700/50 space-y-4">
          <div className="p-3 bg-[#0F9D58]/10 text-[#0F9D58] rounded-2xl w-fit">
            <PackageCheck size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Browse the Current Catalogue</h3>
          <p className="text-xs text-zinc-400">
            Product availability and details can change. The live product page is the source to check before ordering.
          </p>
          <button
            onClick={() => setCurrentView('products')}
            className="w-full py-3 bg-[#0F9D58] hover:bg-[#0B7B44] text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
          >
            View Products
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[32px] p-8 sm:p-10 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg">
            AK
          </div>
          <div className="flex-1 text-left space-y-2">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Built by AK Dev Studio</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
              Pak-Tijarat's website and administration system are developed by AK Dev Studio. Store operations, product availability, delivery and return requests are handled through the published store policies and support channels.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-400">
              <span className="flex items-center gap-1"><Globe size={12} /> Pakistan</span>
              <span>•</span>
              <span>Online retail</span>
              <span>•</span>
              <span>Digital commerce</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
