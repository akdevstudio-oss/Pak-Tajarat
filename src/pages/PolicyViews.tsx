import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, Search, HelpCircle, ShoppingBag, Users, RotateCcw, Globe } from 'lucide-react';

/**
 * Reusable Language Mode Control Bar
 * Allows toggling or unchecking Roman English to switch between Roman English and Standard English
 */
export const LanguageModeBar: React.FC = () => {
  const { isRomanEnglish, setIsRomanEnglish } = useApp();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-emerald-50/90 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 mb-8 gap-3 shadow-xs">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-[#0F9D58]/10 text-[#0F9D58] rounded-xl shrink-0">
          <Globe size={18} />
        </div>
        <div>
          <span className="text-xs font-black text-gray-900 dark:text-white block">
            {isRomanEnglish ? 'Roman English Mode Active' : 'Standard English Mode Active'}
          </span>
          <p className="text-[11px] text-gray-600 dark:text-zinc-300">
            Uncheck the Roman English box to read in Standard English • (انگلش میں پڑھنے کے لیے Roman English باکس کو ان چیک کریں)
          </p>
        </div>
      </div>
      <label className="flex items-center space-x-2.5 cursor-pointer bg-white dark:bg-zinc-900 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-[#0F9D58] transition-all shrink-0">
        <input
          type="checkbox"
          checked={isRomanEnglish}
          onChange={(e) => setIsRomanEnglish(e.target.checked)}
          className="w-4 h-4 text-[#0F9D58] focus:ring-[#0F9D58] rounded cursor-pointer accent-[#0F9D58]"
        />
        <span className="text-xs font-extrabold text-gray-900 dark:text-white select-none">
          Roman English (رومن انگلش)
        </span>
      </label>
    </div>
  );
};

export const PrivacyView: React.FC = () => {
  const { setCurrentView, isRomanEnglish } = useApp();

  return (
    <div className="w-full pb-16 animate-in fade-in duration-300 text-left max-w-4xl mx-auto" id="privacy-policy-view">
      {/* Top Language Toggle Control */}
      <LanguageModeBar />

      <div className="mb-8 border-b border-gray-100 dark:border-zinc-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
          {isRomanEnglish ? 'Privacy Policy (رازداری کی پالیسی)' : 'Privacy Policy'}
        </h1>
        <p className="text-xs text-gray-400">Pak-Tajarat E-Commerce & Affiliate Network • Last Updated: November 2, 2026</p>
      </div>

      <div className="space-y-6 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
        {isRomanEnglish ? (
          <>
            <section className="space-y-2 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">1. Information Collection (Aap ki Maloomat ki Hifazat)</h3>
              <p>
                Pak-Tajarat aap ka naam, email, phone number, delivery address, account/order details aur support messages ko account, order processing, courier delivery, returns aur customer support ke liye istemal kar sakta hai. Delivery ke liye zaroori details mutaliqa courier partner ke saath share ki ja sakti hain.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-gray-900 dark:text-white">2. Affiliate Referral Tracking (Commission Tracking)</h3>
              <p>
                Affiliate referral links aur browser storage cart, wishlist, language/preferences aur referral attribution yaad rakhne ke liye istemal ho sakte hain. Browser storage clear karne se kuch saved preferences ya referral features mutasir ho sakte hain.
              </p>
            </section>

            <section className="space-y-2 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">3. Security & Safety (Data Security)</h3>
              <p>
                Website ka application data MongoDB Atlas mein, jabke uploaded website aur product media Cloudflare R2 mein store hota hai. Website hosting aur API Vercel par chalti hain. Google Analytics aur Microsoft Clarity site usage aur performance samajhne ke liye interaction/analytics data process kar sakte hain. In providers ko service chalane ke liye zaroori data process karna par sakta hai. Hum access controls istemal karte hain, lekin koi bhi online service absolute security ki guarantee nahi de sakti.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-2 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">1. Information Collection & Privacy</h3>
              <p>
                Pak-Tajarat may process information you provide, including your name, email address, phone number, delivery address, account and order details, and support messages. We use this information to manage accounts, process orders, arrange courier delivery, handle return requests, and provide support. Necessary delivery details may be shared with the courier partner fulfilling your order.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-gray-900 dark:text-white">2. Affiliate Referral Tracking</h3>
              <p>
                Referral links and limited browser storage may be used to remember affiliate attribution, cart items, wishlist entries, and site preferences. Clearing browser storage may affect these saved features.
              </p>
            </section>

            <section className="space-y-2 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">3. Cloud Security & Encryption</h3>
              <p>
                Application data is handled through MongoDB Atlas, uploaded website and product media through Cloudflare R2, and website hosting and API delivery through Vercel. Google Analytics and Microsoft Clarity may also process site-usage and interaction data to help measure performance and improve the experience. These providers may process the information needed to operate the store. Access controls are used and service credentials are kept server-side, but no online service can guarantee absolute security.
              </p>
            </section>
          </>
        )}
      </div>

      <div className="mt-12 pt-6 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap gap-4">
        <button onClick={() => setCurrentView('home')} className="bg-[#0F9D58] hover:bg-[#0b7d46] text-white text-xs font-black px-6 py-3 rounded-xl cursor-pointer transition-colors shadow-md">
          Return to Home Page
        </button>
        <button onClick={() => setCurrentView('terms')} className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-800 dark:text-white text-xs font-bold px-6 py-3 rounded-xl cursor-pointer transition-colors">
          View Terms & Conditions
        </button>
      </div>
    </div>
  );
};

export const TermsView: React.FC = () => {
  const { setCurrentView, isRomanEnglish } = useApp();

  return (
    <div className="w-full pb-16 animate-in fade-in duration-300 text-left max-w-4xl mx-auto" id="terms-conditions-view">
      {/* Top Language Toggle Control */}
      <LanguageModeBar />

      <div className="mb-8 border-b border-gray-100 dark:border-zinc-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
          {isRomanEnglish ? 'Terms & Conditions (قواعد و ضوابط)' : 'Terms & Conditions'}
        </h1>
        <p className="text-xs text-gray-400">Pak-Tajarat E-Commerce & Affiliate Network • Effective Date: November 2, 2026</p>
      </div>

      <div className="space-y-8 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
        {isRomanEnglish ? (
          <>
            <section className="space-y-3 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#0F9D58] text-white flex items-center justify-center text-xs">1</span>
                Khasoosi Qawaneen & Qabooliat (Acceptance)
              </h3>
              <p>
                Pak-Tajarat website istemal karne, order dene ya hamare Affiliate Program mein shamil hone par aap in tamam Terms & Conditions ko qabool kartay hain. Agar aap ko in sharaait se koi ikhtelaf hai toh please hamari khidmaat istemal na karein.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#0F9D58] text-white flex items-center justify-center text-xs">2</span>
                Shopping aur Cash on Delivery (COD) Rules
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Prices aur Currency:</strong> Product prices Pakistani Rupees (PKR) mein show ki jati hain. Order confirm karne se pehle checkout par total amount aur applicable delivery charges check karein.</li>
                <li><strong>Cash on Delivery (COD) Verification:</strong> COD orders ke liye customer ko courier partner ki confirmation call answer karna ya WhatsApp verify karna lazmi hai. Payment rider ko parcel lete waqt karni hai.</li>
                <li><strong>Delivery:</strong> Orders TCS, Leopard ya kisi available courier partner ke zariye bheje ja sakte hain. Delivery time aur charges destination aur courier service ke mutabiq farq ho sakte hain; checkout ya support se confirm karein.</li>
                <li><strong>Fake Orders:</strong> Fraudulent ya repeated abusive orders par Pak-Tajarat future orders ko restrict ya decline kar sakta hai.</li>
              </ul>
            </section>

            <section className="space-y-3 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#0F9D58] text-white flex items-center justify-center text-xs">3</span>
                Affiliate Partner Sharaait (Affiliate Rules)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Eligibility:</strong> Registered users Affiliate Partner banne ke liye apply kar sakte hain; approval zaroori hai.</li>
                <li><strong>Commissions:</strong> Referral links se honay wali har successful sale par customer order complete hone par commission credit hoti hai.</li>
                <li><strong>Payout Withdrawals:</strong> Delivered orders ki commission 7-day return period ke baad final hoti hai. Approved payouts JazzCash, EasyPaisa ya direct bank transfer ke zariye process kiye ja sakte hain.</li>
                <li><strong>Mamnooa Tareeqay:</strong> Fake accounts se self-referral, spamming ya galat claims karna strictly prohibited hai. Aisa karne par account aur pending commission forfeit kar di jaye gi.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#0F9D58] text-white flex items-center justify-center text-xs">4</span>
                7-Din Aasaan Wapsi (Returns Guarantee)
              </h3>
              <p>
                Return request ke liye delivery ke 7 din ke andar WhatsApp (+92 326 1604808) par order number aur return ki wajah ke saath rabta karein. Support team eligibility review karke return instructions aur available resolution confirm karegi. Instructions milne se pehle parcel wapas na bhejein.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-3 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#0F9D58] text-white flex items-center justify-center text-xs">1</span>
                Acceptance & Applicability
              </h3>
              <p>
                Welcome to Pak-Tajarat. By accessing or using our website, purchasing products, registering an account, or joining our Enterprise Affiliate Program, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please refrain from using our services.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#0F9D58] text-white flex items-center justify-center text-xs">2</span>
                E-Commerce & Ordering Terms
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Currency & Pricing:</strong> All prices listed on Pak-Tajarat are in Pakistani Rupees (PKR) and are inclusive of standard taxes where applicable. Shipping costs are displayed at checkout.</li>
                <li><strong>Cash on Delivery (COD):</strong> For COD orders, customers must confirm phone verification calls or WhatsApp prompts from our logistics partners. Delivery riders will collect payment upon parcel drop-off.</li>
                <li><strong>Delivery:</strong> Orders may be dispatched through TCS, Leopard, or another available courier partner. Delivery time and charges depend on the destination and courier service; confirm the estimate at checkout or with support.</li>
                <li><strong>False Orders & Address Abuse:</strong> Repeated fraudulent orders or abusive delivery refusals may result in Pak-Tajarat restricting or declining future orders.</li>
              </ul>
            </section>

            <section className="space-y-3 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#0F9D58] text-white flex items-center justify-center text-xs">3</span>
                Enterprise Affiliate Partner Terms
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Eligibility:</strong> Any registered account holder in good standing may apply to become a Pak-Tajarat Affiliate Partner. Applications are subject to manual verification.</li>
                <li><strong>Commissions:</strong> Affiliates earn commission rates on completed, non-returned customer orders placed via their unique referral link or referral code.</li>
                <li><strong>Payout Channels:</strong> Commission is finalized after the order is delivered and the 7-day return period has passed. Approved payouts may be processed through JazzCash, EasyPaisa, or direct bank transfer.</li>
                <li><strong>Forbidden Tactics:</strong> Cookie stuffing, spam messaging, posting fake promotional claims, self-referral through fraudulent accounts, or impersonating Pak-Tajarat staff will lead to immediate account termination and forfeiture of pending commissions.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#0F9D58] text-white flex items-center justify-center text-xs">4</span>
                Returns & Quality Guarantee
              </h3>
              <p>
                To request a return, contact support on WhatsApp (+92 326 1604808) within 7 days of delivery and provide your order number and reason. Support will review eligibility and confirm the return instructions and available resolution. Please do not send an item back before receiving instructions.
              </p>
            </section>
          </>
        )}

        <section className="space-y-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
          <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#0F9D58] text-white flex items-center justify-center text-xs">5</span>
            Contact & Support Channels
          </h3>
          <p className="text-xs">
            For questions regarding these Terms & Conditions or order disputes, contact our legal and customer support team:
          </p>
          <div className="text-xs font-bold space-y-1 text-gray-800 dark:text-zinc-200">
            <p>• WhatsApp Support: +92 326 1604808</p>
            <p>• Official Email: alikhanxada1001@gmail.com</p>
            
          </div>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap gap-4">
        <button onClick={() => setCurrentView('home')} className="bg-[#0F9D58] hover:bg-[#0b7d46] text-white text-xs font-black px-6 py-3 rounded-xl cursor-pointer transition-colors shadow-md">
          Return to Home Page
        </button>
        <button onClick={() => setCurrentView('privacy')} className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-800 dark:text-white text-xs font-bold px-6 py-3 rounded-xl cursor-pointer transition-colors">
          View Privacy Policy
        </button>
        <button onClick={() => setCurrentView('refund')} className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-800 dark:text-white text-xs font-bold px-6 py-3 rounded-xl cursor-pointer transition-colors">
          View Refund Policy
        </button>
      </div>
    </div>
  );
};

export const RefundView: React.FC = () => {
  const { setCurrentView, isRomanEnglish } = useApp();

  return (
    <div className="w-full pb-16 animate-in fade-in duration-300 text-left max-w-4xl mx-auto" id="refund-policy-view">
      {/* Top Language Toggle Control */}
      <LanguageModeBar />

      <div className="mb-8 border-b border-gray-100 dark:border-zinc-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
          {isRomanEnglish ? 'Refund & Return Policy (واپسی اور ریفنڈ)' : 'Refund & Return Policy'}
        </h1>
        <p className="text-xs text-gray-400">Pak-Tajarat E-Commerce & Affiliate Network • Last Updated: November 2, 2026</p>
      </div>

      <div className="space-y-6 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
        {isRomanEnglish ? (
          <>
            <section className="space-y-2 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">1. 7-Din Aasaan Wapsi (7-Day Easy Returns)</h3>
              <p>
                Return request ke liye delivery ke 7 din ke andar WhatsApp (+92 326 1604808) par order number aur return ki wajah ke saath rabta karein. Support team request review karke eligibility aur return instructions confirm karegi.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-gray-900 dark:text-white">2. Refund Processing (Raqam ki Wapsi)</h3>
              <p>
                Returned product receive aur inspect hone ke baad, agar request approve hoti hai, toh support team refund ya exchange ka tareeqa confirm karegi. Return bhejne se pehle support se instructions lena zaroori hai.
              </p>
            </section>

            <section className="space-y-2 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">3. Affiliate Commission Invalidation</h3>
              <p>
                Affiliate commission order fully deliver hone aur 7-day return window khatam hone ke baad final hoti hai. Returned ya refunded orders par koi commission count nahi hoti.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-2 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">1. 7-Day Easy Returns Guarantee</h3>
              <p>
                To request a return, contact WhatsApp support (+92 326 1604808) within 7 days of delivery, provide your order number and explain the reason. Our team will review the request, confirm eligibility, and share the return instructions before you send the item back.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-gray-900 dark:text-white">2. Direct Refund Disbursement</h3>
              <p>
                After an approved return is received and inspected, support will confirm the available refund or exchange arrangement and expected timing. Please wait for return instructions before dispatching an item.
              </p>
            </section>

            <section className="space-y-2 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">3. Affiliate Commission Invalidation</h3>
              <p>
                Commissions are only finalized and credited to the referring associate after the order is fully delivered and is outside the 7-day returns window. If an order is successfully cancelled, returned, or refunded, the transaction generates zero commission.
              </p>
            </section>
          </>
        )}
      </div>

      <div className="mt-12 pt-6 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap gap-4">
        <button onClick={() => setCurrentView('home')} className="bg-[#0F9D58] hover:bg-[#0b7d46] text-white text-xs font-black px-6 py-3 rounded-xl cursor-pointer transition-colors shadow-md">
          Return to Home Page
        </button>
        <button onClick={() => setCurrentView('terms')} className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-800 dark:text-white text-xs font-bold px-6 py-3 rounded-xl cursor-pointer transition-colors">
          View Terms & Conditions
        </button>
      </div>
    </div>
  );
};

export const FaqView: React.FC = () => {
  const { setCurrentView, isRomanEnglish } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'shopping' | 'affiliate' | 'returns'>('all');
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: isRomanEnglish ? 'Tamam Sawalat' : 'All Questions', icon: HelpCircle },
    { id: 'shopping', label: isRomanEnglish ? 'Shopping & Delivery' : 'Shopping & Delivery', icon: ShoppingBag },
    { id: 'affiliate', label: isRomanEnglish ? 'Affiliate Program' : 'Affiliate & Earning', icon: Users },
    { id: 'returns', label: isRomanEnglish ? 'Returns & Refunds' : 'Returns & Refunds', icon: RotateCcw },
  ];

  const faqDataRoman = [
    {
      id: 'q1',
      category: 'shopping',
      question: 'Pak-Tajarat kya hai aur yeh kaise kaam karta hai?',
      answer: 'Pak-Tajarat Pakistan-focused online store hai. Website par jo products is waqt catalogue mein listed hain, aap unki details aur availability check karke order kar sakte hain.'
    },
    {
      id: 'q2',
      category: 'shopping',
      question: 'Delivery charges kitne hain aur parcel kitne din mein milega?',
      answer: 'Orders TCS, Leopard ya available courier partner ke zariye bheje ja sakte hain. Delivery time aur charges aap ke shehar aur courier service par depend karte hain; checkout ya WhatsApp support par confirm karein.'
    },
    {
      id: 'q3',
      category: 'shopping',
      question: 'Kya Cash on Delivery (COD) ki sahulat maujood hai?',
      answer: 'Ji haan, Cash on Delivery available hai jahan checkout par option show ho. Order place karne se pehle apne address ke liye COD availability confirm kar lein.'
    },
    {
      id: 'q4',
      category: 'affiliate',
      question: 'Affiliate Partner banne ki kya fees hai aur kaise join karein?',
      answer: 'Affiliate program ke liye apply karne ke baad approval ka intezar karein. Approved partners ko product media aur referral details mil sakti hain; stock pehle khareedna zaroori nahi.'
    },
    {
      id: 'q5',
      category: 'affiliate',
      question: 'Apni affiliate commission kaise withdraw karwa sakte hain?',
      answer: 'Affiliate commission delivered order ke 7-day return period ke baad final hoti hai. Approved payouts JazzCash, EasyPaisa ya bank transfer ke zariye process kiye ja sakte hain; processing time support se confirm karein.'
    },
    {
      id: 'q6',
      category: 'returns',
      question: 'Agar product pasand na aye ya defective ho toh kya return ho sakta hai?',
      answer: 'Delivery ke 7 din ke andar WhatsApp (+92 326 1604808) par order number aur return ki wajah ke saath request bhejein. Support team request review karke eligibility aur return instructions confirm karegi.'
    }
  ];

  const faqDataEnglish = [
    {
      id: 'q1',
      category: 'shopping',
      question: 'What is Pak-Tajarat and how does it work?',
      answer: 'Pak-Tajarat is a Pakistan-focused online store. Browse the products currently listed in the catalogue, review their details and availability, and contact support if you need help.'
    },
    {
      id: 'q2',
      category: 'shopping',
      question: 'What are the delivery charges and shipping times across Pakistan?',
      answer: 'Orders may be dispatched through TCS, Leopard, or another available courier partner. Delivery times and charges depend on the destination and courier; confirm the estimate at checkout or with support.'
    },
    {
      id: 'q3',
      category: 'shopping',
      question: 'Is Cash on Delivery (COD) available nationwide?',
      answer: 'Cash on Delivery is available where it is offered at checkout. Confirm availability for your delivery address before placing the order.'
    },
    {
      id: 'q4',
      category: 'affiliate',
      question: 'Are there any fees to join the Pak-Tajarat Affiliate Program?',
      answer: 'Apply through your account and wait for approval. Approved partners can promote listed products without purchasing stock upfront; commission terms are shown through the affiliate programme.'
    },
    {
      id: 'q5',
      category: 'affiliate',
      question: 'How do I withdraw my earned affiliate commissions?',
      answer: 'Affiliate commissions are finalized after an order is delivered and its 7-day return period has passed. Approved payouts can be made through JazzCash, EasyPaisa, or bank transfer; ask support about processing time.'
    },
    {
      id: 'q6',
      category: 'returns',
      question: 'What is the return and refund policy for damaged products?',
      answer: 'To request a return, contact WhatsApp support (+92 326 1604808) within 7 days of delivery with your order number and reason. Support will review eligibility and send return instructions before the item is dispatched.'
    }
  ];

  const currentFaqData = isRomanEnglish ? faqDataRoman : faqDataEnglish;

  // Inject FAQ JSON-LD schema for AEO (Answer Engine Optimization)
  useEffect(() => {
    document.title = 'Frequently Asked Questions (FAQ) | Pak-Tajarat';
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqDataEnglish.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: { '@type': 'Answer', text: q.answer }
      }))
    };
    let script = document.getElementById('faq-ld-json') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'faq-ld-json';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(faqSchema);
    return () => { script?.remove(); };
  }, []);

  const filteredFaqs = currentFaqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedIndex(expandedIndex === id ? null : id);
  };

  return (
    <div className="w-full pb-16 animate-in fade-in duration-300 text-left max-w-4xl mx-auto" id="faq-view">
      {/* Top Language Toggle Control */}
      <LanguageModeBar />

      {/* Title Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
          Frequently Asked Questions <span className="text-[#0F9D58]">(FAQs)</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-lg mx-auto">
          {isRomanEnglish 
            ? 'Pak-Tajarat online shopping aur Affiliate Partner program se mutaliq aksar pooche jane wale sawalat ke jawabat yahan daryaft karein.' 
            : 'Find quick, comprehensive answers to common questions regarding orders, Cash on Delivery, shipping, and our Affiliate Partner Program.'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder={isRomanEnglish ? "Sawalat daryaft karein... (e.g. Delivery, EasyPaisa, Commission)" : "Search questions... (e.g. Delivery, COD, Affiliate)"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-2xl text-sm focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/10 transition-all shadow-xs text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Categories Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map((cat, idx) => {
          const IconComponent = cat.icon;
          return (
            <button
              key={cat.id ? `${cat.id}-${idx}` : `cat-${idx}`}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#0F9D58] text-white border-[#0F9D58] shadow-sm scale-102'
                  : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-gray-100 dark:border-zinc-850 hover:bg-gray-50 dark:hover:bg-zinc-850'
              }`}
            >
              <IconComponent size={14} className={activeCategory === cat.id ? 'text-white' : 'text-gray-400'} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Accordion Questions */}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedIndex === faq.id;
            return (
              <div 
                key={faq.id ? `${faq.id}-${idx}` : `faq-${idx}`}
                className={`bg-white dark:bg-zinc-900/60 border rounded-2xl overflow-hidden transition-all duration-200 ${
                  isExpanded 
                    ? 'border-[#0F9D58] shadow-md dark:shadow-green-950/10 bg-white dark:bg-zinc-900' 
                    : 'border-gray-100 dark:border-zinc-850 hover:border-gray-200 dark:hover:border-zinc-800'
                }`}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer focus:outline-none"
                >
                  <span className="font-extrabold text-sm text-gray-800 dark:text-zinc-200 hover:text-[#0F9D58] dark:hover:text-[#0F9D58] transition-colors pr-4">
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-gray-50 dark:bg-zinc-850 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#0F9D58] bg-green-50 dark:bg-green-950/20' : ''}`}>
                    <ChevronDown size={16} />
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-sm text-gray-600 dark:text-zinc-400 leading-relaxed border-t border-gray-50 dark:border-zinc-850/50 bg-gray-50/30 dark:bg-zinc-900/40">
                    <p>{faq.answer}</p>
                    <div className="mt-3 flex items-center space-x-2.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0F9D58]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Category: {faq.category === 'shopping' ? 'Shopping & Delivery' : faq.category === 'affiliate' ? 'Affiliate Program' : 'Returns & Refund'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl">
            <HelpCircle size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-extrabold text-gray-600 dark:text-zinc-400">No matching questions found.</p>
            <p className="text-xs text-gray-400 mt-1">Try searching with other terms like "EasyPaisa" or "Return".</p>
          </div>
        )}
      </div>

      {/* Support Box */}
      <div className="mt-10 p-6 bg-gradient-to-br from-[#0F9D58]/10 to-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">Still have questions? / Koi aur sawal hai?</h4>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Contact our dedicated support team directly on WhatsApp.</p>
        </div>
        <a 
          href="https://wa.me/923261604808" 
          target="_blank" 
          rel="noreferrer" 
          className="inline-flex items-center justify-center bg-[#0F9D58] hover:bg-[#0b7d46] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
        >
          WhatsApp Support (+92 326 1604808)
        </a>
      </div>

      {/* Home Button */}
      <div className="mt-12 pt-6 border-t border-gray-100 dark:border-zinc-800">
        <button onClick={() => setCurrentView('home')} className="bg-[#0F9D58] text-white text-xs font-black px-6 py-2.5 rounded-xl cursor-pointer">
          Return to Home Page
        </button>
      </div>
    </div>
  );
};
