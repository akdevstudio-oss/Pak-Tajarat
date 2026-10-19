import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { 
  Phone, Mail, MapPin, MessageSquare, ShieldCheck, 
  Truck, RotateCcw, Award, CheckCircle, ArrowUp,
  Handshake
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { 
    setCurrentView, 
    addNotification, 
    currentUser, 
    currentAffiliate, 
    setActiveDashboardTab,
    brandingConfig
  } = useApp();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      addNotification('Subscribed!', 'Thank you for joining the Pak-Tajarat newsletter!', 'success');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getButtonTextAndAction = () => {
    if (!currentUser) {
      return {
        text: "Become an Affiliate",
        onClick: () => {
          setCurrentView('auth');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          addNotification('Authentication Required', 'Please log in to apply for the affiliate program.', 'warning');
        }
      };
    }
    
    if (!currentAffiliate) {
      return {
        text: "Become an Affiliate",
        onClick: () => {
          setCurrentView('profile');
          setActiveDashboardTab('affiliate');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    }

    if (currentAffiliate.status === 'active') {
      return {
        text: "Affiliate Dashboard",
        onClick: () => {
          setCurrentView('profile');
          setActiveDashboardTab('affiliate');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    }

    if (currentAffiliate.status === 'pending_approval') {
      return {
        text: "Affiliate Status: Pending",
        onClick: () => {
          setCurrentView('profile');
          setActiveDashboardTab('affiliate');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    }

    if (currentAffiliate.status === 'rejected') {
      return {
        text: "Affiliate: Rejected (Re-apply)",
        onClick: () => {
          setCurrentView('profile');
          setActiveDashboardTab('affiliate');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    }

    return {
      text: "Become an Affiliate",
      onClick: () => {
        setCurrentView('profile');
        setActiveDashboardTab('affiliate');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
  };

  const affiliateButton = getButtonTextAndAction();

  return (
    <footer className="w-full bg-gradient-to-r from-[#061026] via-[#111A2E] to-[#18181B] dark:from-[#030917] dark:via-[#070F1F] dark:to-[#09090B] text-zinc-300 border-t border-zinc-800 transition-colors duration-300" id="main-footer">
      
      {/* Trust & Guarantees Badges */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-b border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
          <div className="p-3 bg-zinc-800/80 text-[#0F9D58] rounded-2xl">
            <Truck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Swift Delivery</h4>
            <p className="text-xs text-zinc-400 mt-1">Across Pakistan in 2-4 business days.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
          <div className="p-3 bg-zinc-800/80 text-[#0F9D58] rounded-2xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">100% Secure Checkout</h4>
            <p className="text-xs text-zinc-400 mt-1">Cash on Delivery & protected card payments.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
          <div className="p-3 bg-zinc-800/80 text-[#0F9D58] rounded-2xl">
            <RotateCcw size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">7-Day Easy Returns</h4>
            <p className="text-xs text-zinc-400 mt-1">Hassle-free 100% money back returns.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
          <div className="p-3 bg-zinc-800/80 text-[#0F9D58] rounded-2xl">
            <Award size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Genuine Products</h4>
            <p className="text-xs text-zinc-400 mt-1">100% authentic items straight from brands.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        
        {/* About Us Column */}
        <div className="space-y-4 text-left">
          <div className="flex items-center space-x-2.5">
            {brandingConfig?.logoType === 'image' && (brandingConfig?.logoImageUrl || brandingConfig?.websiteLogo) ? (
              <img
                src={brandingConfig.logoImageUrl || brandingConfig.websiteLogo}
                alt={brandingConfig.customText || 'Pak-Tijarat'}
                className="h-10 w-auto max-w-[180px] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <>
                <Logo size={42} variant="icon" />
                <span className="text-xl font-black text-white">
                  {brandingConfig?.customText ? (
                    brandingConfig.customText
                  ) : (
                    <>Pak-<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Tajarat</span></>
                  )}
                </span>
              </>
            )}
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Pakistan's trusted digital gateway to premium lifestyle products, state-of-the-art electronics, local design houses, and reliable grocery. Quality checked, carefully packed, and delivered right to your door.
          </p>
          {/* Verified contact channels; do not link to generic social-media homepages */}
          <div className="pt-2 flex items-center space-x-3 text-zinc-400">
            <a href="https://wa.me/923261604808" target="_blank" rel="noreferrer" aria-label="Chat with Pak-Tijarat on WhatsApp" className="p-2 bg-zinc-800 hover:bg-[#0F9D58] hover:text-white rounded-xl transition-all">
              <MessageSquare size={16} />
            </a>
            <a href="mailto:alikhanxada1001@gmail.com" aria-label="Email Pak-Tijarat support" className="p-2 bg-zinc-800 hover:bg-[#0F9D58] hover:text-white rounded-xl transition-all">
              <Mail size={16} />
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="space-y-4 text-left">
          <h3 className="text-white font-bold text-base relative pb-2 before:absolute before:left-0 before:bottom-0 before:w-8 before:h-0.5 before:bg-[#0F9D58]">
            Quick Links
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a 
                href="/" 
                onClick={(e) => { e.preventDefault(); setCurrentView('home'); }} 
                className="hover:text-[#0F9D58] transition-colors cursor-pointer block"
              >
                Home Page
              </a>
            </li>
            <li>
              <a 
                href="/products" 
                onClick={(e) => { e.preventDefault(); setCurrentView('products'); }} 
                className="hover:text-[#0F9D58] transition-colors cursor-pointer block"
              >
                Shop Catalogue
              </a>
            </li>
            <li>
              <a 
                href="/about" 
                onClick={(e) => { e.preventDefault(); setCurrentView('about'); }} 
                className="hover:text-[#0F9D58] transition-colors cursor-pointer block"
              >
                About Us
              </a>
            </li>
            <li>
              <a 
                href="/contact" 
                onClick={(e) => { e.preventDefault(); setCurrentView('contact'); }} 
                className="hover:text-[#0F9D58] transition-colors cursor-pointer block"
              >
                Contact Us
              </a>
            </li>
            <li>
              <a 
                href="/auth" 
                onClick={(e) => { e.preventDefault(); setCurrentView('auth'); }} 
                className="hover:text-[#0F9D58] transition-colors cursor-pointer block"
              >
                Account Login
              </a>
            </li>
            <li>
              <a 
                href="/blog" 
                onClick={(e) => { e.preventDefault(); setCurrentView('blog'); }} 
                className="hover:text-[#0F9D58] transition-colors cursor-pointer font-bold text-emerald-500 block"
              >
                Educational Blogs
              </a>
            </li>
          </ul>
        </div>

        {/* Customer Support Column */}
        <div className="space-y-4 text-left">
          <h3 className="text-white font-bold text-base relative pb-2 before:absolute before:left-0 before:bottom-0 before:w-8 before:h-0.5 before:bg-[#0F9D58]">
            Customer Support
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a 
                href="/contact" 
                onClick={(e) => { e.preventDefault(); setCurrentView('contact'); }} 
                className="hover:text-[#0F9D58] transition-colors text-left cursor-pointer text-zinc-400 block"
              >
                Contact Support
              </a>
            </li>
            <li>
              <a 
                href="/privacy" 
                onClick={(e) => { e.preventDefault(); setCurrentView('privacy'); }} 
                className="hover:text-[#0F9D58] transition-colors text-left cursor-pointer text-zinc-400 block"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a 
                href="/terms" 
                onClick={(e) => { e.preventDefault(); setCurrentView('terms'); }} 
                className="hover:text-[#0F9D58] transition-colors text-left cursor-pointer text-zinc-400 block"
              >
                Terms & Conditions
              </a>
            </li>
            <li>
              <a 
                href="/refund" 
                onClick={(e) => { e.preventDefault(); setCurrentView('refund'); }} 
                className="hover:text-[#0F9D58] transition-colors text-left cursor-pointer text-zinc-400 block"
              >
                Refund Policy
              </a>
            </li>
            <li>
              <a 
                href="/faq" 
                onClick={(e) => { e.preventDefault(); setCurrentView('faq'); }} 
                className="hover:text-[#0F9D58] transition-colors text-left cursor-pointer text-zinc-400 font-bold text-white flex items-center space-x-1"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0F9D58] animate-pulse" />
                <span>FAQs / Ask Questions</span>
              </a>
            </li>
          </ul>

          <div className="pt-4">
            <button
              onClick={affiliateButton.onClick}
              className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              <Handshake size={16} />
              <span>{affiliateButton.text}</span>
            </button>
          </div>
        </div>

        {/* Contact Info Column */}
        <div className="space-y-4 text-left">
          <h3 className="text-white font-bold text-base relative pb-2 before:absolute before:left-0 before:bottom-0 before:w-8 before:h-0.5 before:bg-[#0F9D58]">
            Contact Channels
          </h3>
          <div className="space-y-3.5 text-sm text-zinc-400">
            <a href="https://wa.me/923261604808" target="_blank" rel="noreferrer" className="flex items-center hover:text-white transition-colors">
              <Phone size={16} className="mr-2.5 text-[#0F9D58] shrink-0" />
              <span>WhatsApp: +92 326 1604808</span>
            </a>
            <a href="mailto:alikhanxada1001@gmail.com" className="flex items-center hover:text-white transition-colors truncate">
              <Mail size={16} className="mr-2.5 text-[#0F9D58] shrink-0" />
              <span className="truncate">alikhanxada1001@gmail.com</span>
            </a>
            <p className="flex items-start">
              <MapPin size={16} className="mr-2.5 text-[#0F9D58] mt-0.5 shrink-0" />
              <span>Blue Area, Sector F-6, Islamabad, Pakistan</span>
            </p>
          </div>
          <div className="pt-2 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Easy Payout Partners
            <div className="mt-1.5 flex flex-wrap gap-1 text-[9px] font-bold text-zinc-400">
              <span className="bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800">JazzCash</span>
              <span className="bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800">EasyPaisa</span>
              <span className="bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800">Bank Transfer</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="bg-zinc-950 text-zinc-500 text-xs py-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3 text-center sm:text-left">
            <p>© Pak-Tajarat. All Rights Reserved.</p>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <p className="text-zinc-400 font-medium">Created by <span className="text-[#0F9D58] font-bold">Ali Khanxada</span></p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentView('about')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Our Vision
            </button>
            <span className="h-3 w-px bg-zinc-800" />
            <button 
              onClick={() => setCurrentView('contact')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact Support
            </button>
            <span className="h-3 w-px bg-zinc-800" />
            
            {/* Back to Top */}
            <button 
              onClick={scrollToTop}
              className="bg-zinc-800 text-white p-2 rounded-full hover:bg-[#0F9D58] hover:scale-110 transition-all duration-200 cursor-pointer"
              title="Scroll back to top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
