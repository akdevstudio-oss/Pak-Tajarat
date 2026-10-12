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
        <p className="text-xs text-gray-400">Pak-Tajarat E-Commerce & Affiliate Network • Last Updated: June 30, 2026</p>
      </div>

      <div className="space-y-6 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
        {isRomanEnglish ? (
          <>
            <section className="space-y-2 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">1. Information Collection (Aap ki Maloomat ki Hifazat)</h3>
              <p>
                Pak-Tajarat par aap ka personal data poori tarah mehfooz hai. Hum aap ka naam, delivery address, email aur phone number sirf checkout calculations aur parcel dispatch karne ke liye istemal kartay hain. Hum aap ki kisi maloomat ko teesri party ad networks ke sath share ya sell nahi kartay.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-gray-900 dark:text-white">2. Affiliate Referral Tracking (Commission Tracking)</h3>
              <p>
                Jab aap kisi Affiliate partner link ke zariye khareedari kartay hain, toh hum session cookies aur identifiers (`ref` parameter) istemal kartay hain taake referral commission sahi account mein credit ho sakay. Order hone par yeh automatic clear ho jata hai.
              </p>
            </section>

            <section className="space-y-2 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">3. Security & Safety (Data Security)</h3>
              <p>
                Tamam important information encrypted Firebase Firestore servers par store hoti hai. Transactions audited hotay hain taake har customer ke credentials aur account details safe rahein.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-2 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">1. Information Collection & Privacy</h3>
              <p>
                At Pak-Tajarat, we prioritize your data privacy and security. We collect delivery details including full name, shipping address, email address, and phone number strictly for checkout processing, order verification, and parcel dispatch. We do not sell, exchange, or distribute your personal details to third-party ad networks.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-gray-900 dark:text-white">2. Affiliate Referral Tracking</h3>
              <p>
                When purchasing products through an Affiliate partner network link, session-level cookies and URL tracking parameters (such as `ref`) are used to credit commission points accurately to the referring associate. These cookies track anonymous navigational events and automatically clear upon checkout.
              </p>
            </section>

            <section className="space-y-2 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">3. Cloud Security & Encryption</h3>
              <p>
                All sensitive information is stored securely on encrypted Firebase Firestore cloud infrastructure protected by strict security rules. Payment transactions and account operations are regularly audited to defend shopper credentials against unauthorized access.
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
        <p className="text-xs text-gray-400">Pak-Tajarat E-Commerce & Affiliate Network • Effective Date: June 30, 2026</p>
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
                <li><strong>Prices aur Currency:</strong> Pak-Tajarat par tamam product prices Pakistani Rupee (PKR) mein hain aur tamam taxes included hain. Shipping charges checkout par show hotay hain.</li>
                <li><strong>Cash on Delivery (COD) Verification:</strong> COD orders ke liye customer ko courier partner ki confirmation call answer karna ya WhatsApp verify karna lazmi hai. Payment rider ko parcel lete waqt karni hai.</li>
                <li><strong>Delivery Timeframe:</strong> Pakistan ke tamam bare shehron (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Sialkot, Peshawar, Quetta, Multan) mein delivery 2 se 4 business days mein ho jati hai.</li>
                <li><strong>Fake Orders:</strong> Jhootay orders ya bilawajah delivery reject karne par account ko permanent blacklist kar diya jaye ga.</li>
              </ul>
            </section>

            <section className="space-y-3 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#0F9D58] text-white flex items-center justify-center text-xs">3</span>
                Affiliate Partner Sharaait (Affiliate Rules)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Eligibility:</strong> Koi bhi registered user Pak-Tajarat Affiliate Partner ban sakta hai.</li>
                <li><strong>Commissions:</strong> Referral links se honay wali har successful sale par customer order complete hone par commission credit hoti hai.</li>
                <li><strong>Payout Withdrawals:</strong> Kamayi hui commission JazzCash, EasyPaisa ya direct Bank Account mein minimum Rs. 1,000 hone par withdraw karwayein.</li>
                <li><strong>Mamnooa Tareeqay:</strong> Fake accounts se self-referral, spamming ya galat claims karna strictly prohibited hai. Aisa karne par account aur pending commission forfeit kar di jaye gi.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#0F9D58] text-white flex items-center justify-center text-xs">4</span>
                7-Din Aasaan Wapsi (Returns Guarantee)
              </h3>
              <p>
                Hum apne tamam catalog items par 7-Day Hassle-Free Return & Exchange guarantee dete hain. Product damaged hone par delivery ke 7 din ke andar WhatsApp (+92 326 1604808) par rabta karke refund ya exchange paayein.
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
                <li><strong>Order Fulfillment:</strong> Deliveries across major Pakistani cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Sialkot, Peshawar, Quetta, Multan) typically arrive within 2 to 4 business days. Remote areas may require additional time.</li>
                <li><strong>False Orders & Address Abuse:</strong> Intentional placement of false orders or refusing delivery without valid cause may result in temporary or permanent blacklist status across our logistics network.</li>
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
                <li><strong>Payout Channels:</strong> Approved earnings can be withdrawn to verified Pakistani financial channels including JazzCash, EasyPaisa, or direct Bank Accounts once reaching the minimum payout threshold (Rs. 1,000).</li>
                <li><strong>Forbidden Tactics:</strong> Cookie stuffing, spam messaging, posting fake promotional claims, self-referral through fraudulent accounts, or impersonating Pak-Tajarat staff will lead to immediate account termination and forfeiture of pending commissions.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#0F9D58] text-white flex items-center justify-center text-xs">4</span>
                Returns & Quality Guarantee
              </h3>
              <p>
                We stand behind the quality of all catalog items with a 7-day hassle-free return and exchange guarantee. If an item arrives damaged, defective, or misdescribed, customers may contact support via WhatsApp (+92 326 1604808) within 7 days of delivery for a replacement or full refund.
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
            <p>• Head Office: Blue Area, Sector F-6, Islamabad, Pakistan</p>
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
        <p className="text-xs text-gray-400">Pak-Tajarat E-Commerce & Affiliate Network • Last Updated: June 30, 2026</p>
      </div>

      <div className="space-y-6 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
        {isRomanEnglish ? (
          <>
            <section className="space-y-2 bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white">1. 7-Din Aasaan Wapsi (7-Day Easy Returns)</h3>
              <p>
                Hum tamam products par 7-Day Return Guarantee dete hain. Agar aap ko milnay wala product defective, damaged ya specification se mukhtalif ho, toh 7 din ke andar WhatsApp (+92 326 1604808) par rabta karke wapsi initiate karein.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-gray-900 dark:text-white">2. Refund Processing (Raqam ki Wapsi)</h3>
              <p>
                Product warehouse mein wapis check hone par, aap ka refund direct aap ke EasyPaisa, JazzCash ya Bank Account mein transfer kar diya jata hai. Product ka original box aur tags intact hone chahiye.
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
                We offer a comprehensive, hassle-free 7-day return policy on all catalog listings. If you receive an item that is defective, damaged, or mismatched from specifications, contact us via WhatsApp (+92 326 1604808) within 7 days to initiate returns.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-black text-gray-900 dark:text-white">2. Direct Refund Disbursement</h3>
              <p>
                Refund payments are disbursed directly to your specified EasyPaisa, JazzCash, or bank account credentials once our warehouse verifies the returned item's condition. The item must remain complete with its original boxed packaging and tags intact.
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
      answer: 'Pak-Tajarat Pakistan ka ek trusted digital marketplace aur affiliate platform hai. Yahan aap electronics, fashion, beauty aur home accessories ki online shopping kar sakte hain, aur ba-asani hamara Affiliate partner ban kar har successful sale par behtareen commission kama sakte hain.'
    },
    {
      id: 'q2',
      category: 'shopping',
      question: 'Delivery charges kitne hain aur parcel kitne din mein milega?',
      answer: 'Poore Pakistan mein delivery 2 se 4 working days ke andar ki jati hai. Islamabad/Rawalpindi mein delivery mazeed jaldi ho jati hai. Standard delivery charges order details aur location ke mutabiq checkout screen par clear dikhaye jate hain.'
    },
    {
      id: 'q3',
      category: 'shopping',
      question: 'Kya Cash on Delivery (COD) ki sahulat maujood hai?',
      answer: 'Ji haan! Hum poore Pakistan mein Cash on Delivery (COD) ki complete sahulat faraham karte hain. Jab parcel aapko mile, tabhi aapne payment rider ko karni hai, taake aapka aitmad aur paisa dono mehfooz rahein.'
    },
    {
      id: 'q4',
      category: 'affiliate',
      question: 'Affiliate Partner banne ki kya fees hai aur kaise join karein?',
      answer: 'Pak-Tajarat Affiliate Partner program bilkul FREE hai! Koi hidden fees ya registration charges nahi hain. Bas apna account create karein, Profile Section mein "Become an Affiliate" par click karke details submit karein, aur approval ke baad apna kamao referral link hasil karein.'
    },
    {
      id: 'q5',
      category: 'affiliate',
      question: 'Apni affiliate commission kaise withdraw karwa sakte hain?',
      answer: 'Aapki kamayi hui commission direct aapke EasyPaisa, JazzCash ya Bank Account mein send ki jati hai. Bas apne dashboard par ja kar withdrawal request submit karein, aur hamari finance team 24 working hours ke andar aapko direct payment transfer kar degi.'
    },
    {
      id: 'q6',
      category: 'returns',
      question: 'Agar product pasand na aye ya defective ho toh kya return ho sakta hai?',
      answer: 'Ji haan, hum 7-Day Easy Return & Refund guarantee dete hain! Agar aapko product damaged ya specifications se mukhtalif mile, toh 7 din ke andar hamare official WhatsApp (+92 326 1604808) par rabta karein. Parcel return hone par aapko aapki raqam EasyPaisa ya JazzCash par wapis mil jayegi.'
    }
  ];

  const faqDataEnglish = [
    {
      id: 'q1',
      category: 'shopping',
      question: 'What is Pak-Tajarat and how does it work?',
      answer: 'Pak-Tajarat is Pakistan\'s premier e-commerce marketplace and affiliate network. You can shop top-quality electronics, fashion, beauty, and home essentials with nationwide Cash on Delivery, or join our Affiliate program to earn commissions on shared sales.'
    },
    {
      id: 'q2',
      category: 'shopping',
      question: 'What are the delivery charges and shipping times across Pakistan?',
      answer: 'Nationwide delivery across major Pakistani cities takes 2 to 4 business days. Express delivery is available for Islamabad and Rawalpindi. Shipping fees are calculated and clearly shown during checkout.'
    },
    {
      id: 'q3',
      category: 'shopping',
      question: 'Is Cash on Delivery (COD) available nationwide?',
      answer: 'Yes! We offer 100% Cash on Delivery (COD) services across all cities and towns in Pakistan. You only pay the courier rider upon physical inspection of parcel drop-off.'
    },
    {
      id: 'q4',
      category: 'affiliate',
      question: 'Are there any fees to join the Pak-Tajarat Affiliate Program?',
      answer: 'Joining the Pak-Tajarat Affiliate Program is completely FREE with zero registration fees or hidden charges. Simply create an account, apply in your Profile Dashboard, and start sharing your custom referral links.'
    },
    {
      id: 'q5',
      category: 'affiliate',
      question: 'How do I withdraw my earned affiliate commissions?',
      answer: 'Approved commissions are transferred directly to your JazzCash, EasyPaisa, or Pakistani Bank Account. Submit a withdrawal request from your Affiliate Portal, and funds are disbursed within 24 working hours.'
    },
    {
      id: 'q6',
      category: 'returns',
      question: 'What is the return and refund policy for damaged products?',
      answer: 'We provide a 7-Day Hassle-Free Return & Refund Guarantee. If your product arrives damaged or defective, contact our WhatsApp support (+92 326 1604808) within 7 days for an immediate exchange or full refund.'
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
