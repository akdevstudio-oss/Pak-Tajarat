import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, Truck, ShieldCheck, HeartHandshake, Award, Star, Globe } from 'lucide-react';

export const AboutView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="w-full pb-16 animate-in fade-in duration-300" id="about-container">

      {/* Hidden speakable content for GEO/Voice Search */}
      <span className="speakable sr-only">
        Pak-Tajarat is Pakistan's premier digital e-commerce marketplace offering electronics, fashion, home decor, beauty, and groceries with Cash on Delivery across all major cities.
      </span>

      {/* Hero Branding Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-black uppercase text-[#0F9D58] tracking-widest bg-[#0F9D58]/10 px-3.5 py-1.5 rounded-full">
          Our Vision & Legacy
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mt-4 leading-tight">
          Pakistan's Premier Digital <br />
          <span className="text-[#0F9D58]">E-Commerce Gateway</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-4 leading-relaxed">
          At <strong className="text-gray-900 dark:text-white font-black">Pak-Tajarat</strong>, we are committed to elevating the online shopping standard across Pakistan by combining authentic high-end products, highly secured COD payment infrastructure, and rapid courier delivery.
        </p>
      </div>

      {/* Bento Stats / Value Propositions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[32px] p-6 text-left space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-[#0F9D58]/10 text-[#0F9D58] rounded-2xl w-fit">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white">100% Genuine Checks</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Every vendor profile, product listing, and packaged item is subjected to rigorous authentic assessments. We hold a zero-tolerance policy against counterfeits.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[32px] p-6 text-left space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit">
            <Truck size={24} />
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white">Swift Express Delivery</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Our strategic partnerships with top-tier courier partners ensure that products are shipped out of our centralized Islamabad hub to your doorstep within 2 to 4 business days.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[32px] p-6 text-left space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl w-fit">
            <HeartHandshake size={24} />
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white">Affiliate Empowerment</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            We operate a robust state-of-the-art Amazon-like Associates program, enabling content creators, social marketers, and everyday buyers to earn commissions on delivered purchases.
          </p>
        </div>
      </div>

      {/* Company Story Block */}
      <div className="bg-zinc-900 text-zinc-100 rounded-[36px] p-8 sm:p-12 text-left max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-12">
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Supporting Local & Global Brands
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Formed in Islamabad with a team of customer advocates, Pak-Tajarat serves as the central bridge connecting consumers with exceptional fashion, beauty, electronics, grocery, and home goods. We emphasize support for regional craftsmanship, small boutique businesses, and local suppliers.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-zinc-300">
            <span className="bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700/50">Islamabad HQ</span>
            <span className="bg-[#0F9D58]/10 text-[#0F9D58] px-3 py-1.5 rounded-lg border border-[#0F9D58]/20">Verified Affiliate Network</span>
            <span className="bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700/50">24/7 Live Customer Care</span>
          </div>
        </div>

        <div className="md:col-span-5 bg-zinc-800 rounded-3xl p-6 border border-zinc-700/50 space-y-4">
          <h3 className="text-lg font-bold text-white">Need Consultation?</h3>
          <p className="text-xs text-zinc-400">
            For business collaborations, wholesale imports, or inquiries, please visit our contact portal or connect with our customer relations team.
          </p>
          <button
            onClick={() => setCurrentView('contact')}
            className="w-full py-3 bg-[#0F9D58] hover:bg-[#0B7B44] text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
          >
            Visit Support Desk
          </button>
        </div>
      </div>

      {/* E-E-A-T: Founder & Expert Credentials for GEO Trust Signals */}
      <div className="max-w-5xl mx-auto bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[32px] p-8 sm:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-lg">
            AK
          </div>
          <div className="flex-1 text-left space-y-2">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Ali Khanxada</h3>
              <span className="text-[10px] bg-[#0F9D58]/10 text-[#0F9D58] font-black px-2.5 py-1 rounded-full border border-[#0F9D58]/20 uppercase tracking-wider">
                Founder & CEO
              </span>
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950/20 text-blue-600 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Verified Expert
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
              Ali Khanxada is a Pakistan-based e-commerce entrepreneur and digital business strategist with expertise in online retail, affiliate marketing, and B2B trade. He founded Pak-Tajarat to create a reliable, transparent, and locally-rooted online marketplace for Pakistani consumers and businesses.
            </p>
            <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-bold text-gray-400">
              <span className="flex items-center gap-1"><Globe size={10} /> Pakistan</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Award size={10} /> E-Commerce</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Star size={10} /> Affiliate Marketing</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Users size={10} /> B2B Trade</span>
            </div>
          </div>
        </div>

        {/* Trust & Stats Row */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
          <div>
            <p className="text-2xl font-black text-[#0F9D58]">Nationwide</p>
            <p className="text-xs text-gray-500 font-bold mt-0.5">Customer Reach</p>
          </div>
          <div>
            <p className="text-2xl font-black text-[#0F9D58]">Admin-Managed</p>
            <p className="text-xs text-gray-500 font-bold mt-0.5">Product Catalog</p>
          </div>
          <div>
            <p className="text-2xl font-black text-[#0F9D58]">9</p>
            <p className="text-xs text-gray-500 font-bold mt-0.5">Product Categories</p>
          </div>
          <div>
            <p className="text-2xl font-black text-[#0F9D58]">COD</p>
            <p className="text-xs text-gray-500 font-bold mt-0.5">Payment Option</p>
          </div>
        </div>
      </div>
    </div>
  );
};
