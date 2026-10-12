import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Globe, Briefcase, ChevronRight, HelpCircle, AlertCircle, FileText, CheckCircle, MapPin, CreditCard, Sparkles } from 'lucide-react';
import { AffiliateTermsModal } from './AffiliateTermsModal';

interface AffiliateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AffiliateApplicationModal: React.FC<AffiliateApplicationModalProps> = ({ isOpen, onClose }) => {
  const { submitAffiliateApplication, currentAffiliateApplication } = useApp();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [province, setProvince] = useState('Punjab');
  const [city, setCity] = useState('');
  const [completeAddress, setCompleteAddress] = useState('');
  
  // Payment Details
  const [paymentMethod, setPaymentMethod] = useState<'Bank' | 'JazzCash' | 'EasyPaisa' | 'NayaPay'>('EasyPaisa');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Social Links
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [youtube, setYoutube] = useState('');
  const [website, setWebsite] = useState('');

  const [previousAffiliateExperience, setPreviousAffiliateExperience] = useState<boolean | null>(null);
  const [previousAffiliatePrograms, setPreviousAffiliatePrograms] = useState('');
  const [promotionMethods, setPromotionMethods] = useState<string[]>([]);
  const [otherPromotionMethod, setOtherPromotionMethod] = useState('');
  const [reasonForJoining, setReasonForJoining] = useState('');
  const [estimatedMonthlySales, setEstimatedMonthlySales] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Modal State for Terms & Conditions
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Validation / Error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countries = [
    'Pakistan',
    'United Arab Emirates',
    'Saudi Arabia',
    'United Kingdom',
    'United States',
  ];

  const promotionOptions = [
    'Social Media (Facebook, Instagram, etc.)',
    'Blog / Website',
    'YouTube Channel',
    'Email Marketing',
    'WhatsApp / Telegram Groups',
    'Other',
  ];

  const salesVolumeOptions = [
    'Less than Rs. 10,000',
    'Rs. 10,000 - Rs. 50,000',
    'Rs. 50,000 - Rs. 200,000',
    'More than Rs. 200,000',
  ];

  const handleCheckboxChange = (option: string) => {
    if (promotionMethods.includes(option)) {
      setPromotionMethods(prev => prev.filter(item => item !== option));
    } else {
      setPromotionMethods(prev => [...prev, option]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Full Name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters.';
    } else if (fullName.trim().length > 100) {
      newErrors.fullName = 'Full Name must not exceed 100 characters.';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Please enter a valid email address.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Mobile Number validation (Pakistani format check)
    // Supports: 03xxxxxxxxx or +923xxxxxxxxx or 923xxxxxxxxx (with or without dashes)
    const cleanedMobile = mobileNumber.replace(/[\s-]/g, '');
    const mobileRegex = /^((\+92)?(3\d{9})|(03\d{9}))$/;
    if (!cleanedMobile) {
      newErrors.mobileNumber = 'Please enter a valid Pakistani mobile number (e.g., 03001234567 or +923001234567).';
    } else if (!mobileRegex.test(cleanedMobile)) {
      newErrors.mobileNumber = 'Please enter a valid Pakistani mobile number (e.g., 03001234567 or +923001234567).';
    }

    // Country validation
    if (!country) {
      newErrors.country = 'Please select your country of residence.';
    }

    // Address & Location validation
    if (!city.trim()) {
      newErrors.city = 'Please enter your city name.';
    }
    if (!completeAddress.trim()) {
      newErrors.completeAddress = 'Please enter your complete address.';
    }

    // Payment validation
    if (!accountTitle.trim()) {
      newErrors.accountTitle = 'Please enter the account title.';
    }
    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Please enter the account or IBAN / phone number.';
    }

    // Experience validation
    if (previousAffiliateExperience === null) {
      newErrors.previousAffiliateExperience = 'Please indicate if you have previous affiliate marketing experience.';
    }

    // Promotion Methods validation
    if (promotionMethods.length === 0) {
      newErrors.promotionMethods = 'Please select at least one promotion method.';
    }

    // Other Promotion Method validation
    if (promotionMethods.includes('Other')) {
      if (!otherPromotionMethod.trim()) {
        newErrors.otherPromotionMethod = 'Please specify your other promotion method.';
      } else if (otherPromotionMethod.trim().length < 3 || otherPromotionMethod.trim().length > 100) {
        newErrors.otherPromotionMethod = 'Specification must be between 3 and 100 characters.';
      }
    }

    // Motivation validation
    if (!reasonForJoining.trim()) {
      newErrors.reasonForJoining = 'Please explain your motivation in at least 30 characters.';
    } else if (reasonForJoining.trim().length < 30) {
      newErrors.reasonForJoining = `Please explain your motivation in at least 30 characters. Current: ${reasonForJoining.trim().length}/30`;
    } else if (reasonForJoining.trim().length > 5000) {
      newErrors.reasonForJoining = 'Motivation letter must not exceed 5000 characters.';
    }

    // Estimated Sales validation
    if (!estimatedMonthlySales) {
      newErrors.estimatedMonthlySales = 'Please select your estimated monthly sales volume.';
    }

    // Terms Agreement validation
    if (!acceptedTerms) {
      newErrors.acceptedTerms = 'You must agree to the terms and conditions to submit your application.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const element = document.getElementById(`field-${firstErrorKey}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setIsSubmitting(true);
    const success = await submitAffiliateApplication({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      country,
      province,
      city: city.trim(),
      completeAddress: completeAddress.trim(),
      address: `${completeAddress.trim()}, ${city.trim()}, ${province}, ${country}`,
      paymentMethod,
      accountTitle: accountTitle.trim(),
      accountNumber: accountNumber.trim(),
      socialMedia: {
        facebook: facebook.trim(),
        instagram: instagram.trim(),
        tiktok: tiktok.trim(),
        youtube: youtube.trim(),
        website: website.trim(),
        linkedin: ''
      },
      previousAffiliateExperience: !!previousAffiliateExperience,
      previousAffiliatePrograms: previousAffiliateExperience ? previousAffiliatePrograms.trim() : '',
      promotionMethods,
      otherPromotionMethod: promotionMethods.includes('Other') ? otherPromotionMethod.trim() : '',
      reasonForJoining: reasonForJoining.trim(),
      estimatedMonthlySales,
      acceptedTerms,
    });

    setIsSubmitting(false);
    if (success) {
      // Clear form states
      setFullName('');
      setEmail('');
      setMobileNumber('');
      setCountry('Pakistan');
      setPreviousAffiliateExperience(null);
      setPreviousAffiliatePrograms('');
      setPromotionMethods([]);
      setOtherPromotionMethod('');
      setReasonForJoining('');
      setEstimatedMonthlySales('');
      setAcceptedTerms(false);
      
      // Close modal
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        id="affiliate-application-modal-overlay"
      >
        {/* Dark transparent Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => {}} // Disables closing by clicking outside the modal
          className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          style={{ pointerEvents: 'auto' }}
        />

        {/* Modal Window Container */}
        <motion.div 
          initial={{ scale: 0.93, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative bg-white dark:bg-zinc-900 w-full max-w-3xl h-[90vh] md:h-[85vh] rounded-[28px] md:rounded-[36px] shadow-2xl flex flex-col border border-gray-100 dark:border-zinc-800 text-left overflow-hidden z-10"
          id="affiliate-application-modal-window"
        >
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-zinc-950/25">
            <div>
              <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white" id="modal-header-title">
                Join the Pak-Tajarat Affiliate Program
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Fill out the enrollment application to get approved for our high-payout marketing network.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-gray-300 transition-colors shadow-sm shrink-0"
              id="modal-close-icon-btn"
              title="Close Application"
            >
              <X size={18} />
            </button>
          </div>

          {/* Banner Description */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30 px-6 md:px-8 py-3 shrink-0 flex items-start space-x-3 text-xs text-emerald-800 dark:text-emerald-400">
            <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <p className="leading-relaxed font-medium">
              Become a Pak-Tajarat Affiliate Partner and earn commissions by promoting our products. Complete the application below. Our team will review your application within 1–2 business days.
            </p>
          </div>

          {/* Form scrollable content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8" id="affiliate-form-element">
            
            {/* Section 1: Personal Information */}
            <div className="space-y-4" id="section-personal-info">
              <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
                <User size={16} className="text-[#0F9D58]" />
                <h3 className="text-xs font-black text-gray-800 dark:text-zinc-200 uppercase tracking-widest">
                  1. Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5 text-left" id="field-fullName">
                  <label className="text-[11px] font-black text-gray-600 dark:text-zinc-300 uppercase tracking-wider block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="e.g. Muhammad Ali"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      maxLength={100}
                      className={`w-full bg-gray-50 dark:bg-zinc-950 border ${errors.fullName ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58]'} rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-white focus:outline-none transition-shadow`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5 text-left" id="field-email">
                  <label className="text-[11px] font-black text-gray-600 dark:text-zinc-300 uppercase tracking-wider block">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email"
                    placeholder="e.g. ali@example.pk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-gray-50 dark:bg-zinc-950 border ${errors.email ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58]'} rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-white focus:outline-none transition-shadow`}
                  />
                  {errors.email && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5 text-left" id="field-mobileNumber">
                  <label className="text-[11px] font-black text-gray-600 dark:text-zinc-300 uppercase tracking-wider block">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel"
                    placeholder="e.g. 03001234567 or +923001234567"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className={`w-full bg-gray-50 dark:bg-zinc-950 border ${errors.mobileNumber ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58]'} rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-white focus:outline-none transition-shadow`}
                  />
                  {errors.mobileNumber && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>

                {/* Country Selection */}
                <div className="space-y-1.5 text-left" id="field-country">
                  <label className="text-[11px] font-black text-gray-600 dark:text-zinc-300 uppercase tracking-wider block">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={`w-full bg-gray-50 dark:bg-zinc-950 border ${errors.country ? 'border-red-500' : 'border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58]'} rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-white focus:outline-none transition-shadow`}
                  >
                    {countries.map((c, idx) => (
                      <option key={`${c}-${idx}`} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.country}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Experience & Promotion Details */}
            <div className="space-y-4" id="section-experience-details">
              <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
                <Briefcase size={16} className="text-[#0F9D58]" />
                <h3 className="text-xs font-black text-gray-800 dark:text-zinc-200 uppercase tracking-widest">
                  2. Experience & Promotion Details
                </h3>
              </div>

              {/* Marketing Experience Radio Buttons */}
              <div className="space-y-2 text-left" id="field-previousAffiliateExperience">
                <label className="text-[11px] font-black text-gray-600 dark:text-zinc-300 uppercase tracking-wider block">
                  Do you have previous affiliate marketing experience? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-6 mt-1">
                  <label className="flex items-center space-x-2.5 text-xs text-gray-700 dark:text-zinc-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="experience"
                      checked={previousAffiliateExperience === true}
                      onChange={() => setPreviousAffiliateExperience(true)}
                      className="w-4 h-4 text-[#0F9D58] focus:ring-[#0F9D58] border-gray-300"
                    />
                    <span className="font-bold">Yes</span>
                  </label>
                  <label className="flex items-center space-x-2.5 text-xs text-gray-700 dark:text-zinc-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="experience"
                      checked={previousAffiliateExperience === false}
                      onChange={() => {
                        setPreviousAffiliateExperience(false);
                        setPreviousAffiliatePrograms('');
                      }}
                      className="w-4 h-4 text-[#0F9D58] focus:ring-[#0F9D58] border-gray-300"
                    />
                    <span className="font-bold">No</span>
                  </label>
                </div>
                {errors.previousAffiliateExperience && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.previousAffiliateExperience}
                  </p>
                )}
              </div>

              {/* Conditionally rendered experience text area */}
              <AnimatePresence>
                {previousAffiliateExperience === true && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-1.5 text-left"
                    id="field-previousAffiliatePrograms"
                  >
                    <label className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
                      Which affiliate programs have you worked with previously?
                    </label>
                    <textarea 
                      placeholder="e.g. Amazon Associates, Daraz Affiliate, local networks, etc. (Max 500 characters)"
                      value={previousAffiliatePrograms}
                      onChange={(e) => setPreviousAffiliatePrograms(e.target.value)}
                      maxLength={500}
                      rows={3}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58] rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-0 transition-shadow resize-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Promotion Methods Checkboxes */}
              <div className="space-y-2 text-left" id="field-promotionMethods">
                <label className="text-[11px] font-black text-gray-600 dark:text-zinc-300 uppercase tracking-wider block">
                  How will you promote Pak-Tajarat products? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                  {promotionOptions.map((option, idx) => (
                    <label key={`${option}-${idx}`} className="flex items-center space-x-2.5 text-xs text-gray-700 dark:text-zinc-300 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={promotionMethods.includes(option)}
                        onChange={() => handleCheckboxChange(option)}
                        className="rounded text-[#0F9D58] focus:ring-[#0F9D58] border-gray-300 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-medium">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.promotionMethods && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.promotionMethods}
                  </p>
                )}
              </div>

              {/* Conditionally rendered other promotion text input */}
              <AnimatePresence>
                {promotionMethods.includes('Other') && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-1.5 text-left"
                    id="field-otherPromotionMethod"
                  >
                    <label className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
                      Please specify your other promotion method <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Offline network, print catalog"
                      value={otherPromotionMethod}
                      onChange={(e) => setOtherPromotionMethod(e.target.value)}
                      maxLength={100}
                      className={`w-full bg-gray-50 dark:bg-zinc-950 border ${errors.otherPromotionMethod ? 'border-red-500' : 'border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58]'} rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-white focus:outline-none transition-shadow`}
                    />
                    {errors.otherPromotionMethod && (
                      <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.otherPromotionMethod}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Section 3: Motivation & Sales Projection */}
            <div className="space-y-4" id="section-motivation-sales">
              <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
                <HelpCircle size={16} className="text-[#0F9D58]" />
                <h3 className="text-xs font-black text-gray-800 dark:text-zinc-200 uppercase tracking-widest">
                  3. Motivation & Sales Projections
                </h3>
              </div>

              {/* Why do you want to join */}
              <div className="space-y-1.5 text-left" id="field-reasonForJoining">
                <label className="text-[11px] font-black text-gray-600 dark:text-zinc-300 uppercase tracking-wider block">
                  Why do you want to join the Pak-Tajarat Affiliate Program? <span className="text-red-500">*</span>
                </label>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mb-1">
                  Please explain your promotional strategy, target audience, and why you believe you'll succeed. (Minimum 30 characters)
                </div>
                <textarea 
                  placeholder="e.g. I run an active social media page with 50,000+ followers in Pakistan focusing on tech reviews. I'd love to share direct links to your quality electronics store with my audience..."
                  value={reasonForJoining}
                  onChange={(e) => setReasonForJoining(e.target.value)}
                  maxLength={5000}
                  rows={4}
                  className={`w-full bg-gray-50 dark:bg-zinc-950 border ${errors.reasonForJoining ? 'border-red-500' : 'border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58]'} rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-0 transition-shadow resize-y`}
                />
                <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono">
                  <span>{reasonForJoining.trim().length >= 30 ? '✅ Requirement met' : 'Min 30 characters'}</span>
                  <span>{reasonForJoining.trim().length} / 5000 chars</span>
                </div>
                {errors.reasonForJoining && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.reasonForJoining}
                  </p>
                )}
              </div>

              {/* Estimated monthly sales volume */}
              <div className="space-y-1.5 text-left" id="field-estimatedMonthlySales">
                <label className="text-[11px] font-black text-gray-600 dark:text-zinc-300 uppercase tracking-wider block">
                  Estimated Monthly Sales Volume <span className="text-red-500">*</span>
                </label>
                <select
                  value={estimatedMonthlySales}
                  onChange={(e) => setEstimatedMonthlySales(e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-zinc-950 border ${errors.estimatedMonthlySales ? 'border-red-500' : 'border-gray-200 dark:border-zinc-800 focus:border-[#0F9D58]'} rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-white focus:outline-none transition-shadow`}
                >
                  <option value="" disabled>Select your monthly sales estimate...</option>
                  {salesVolumeOptions.map((option, idx) => (
                    <option key={`${option}-${idx}`} value={option}>{option}</option>
                  ))}
                </select>
                {errors.estimatedMonthlySales && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.estimatedMonthlySales}
                  </p>
                )}
              </div>
            </div>

            {/* Section 4: Terms & Conditions Agreement */}
            <div className="p-5 bg-gray-50 dark:bg-zinc-950/25 border border-gray-100 dark:border-zinc-800 rounded-2xl text-left space-y-3" id="section-terms-agreement">
              <div className="flex items-center space-x-2">
                <FileText size={16} className="text-[#0F9D58]" />
                <h4 className="font-extrabold text-xs text-gray-800 dark:text-zinc-200 uppercase tracking-wider">
                  Terms & Conditions Agreement
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                By checking the box below, you affirm that the information provided is correct, and agree to the Pak-Tajarat partner regulations. Complying with marketing guidelines, including avoiding spam link distribution, is required. Commissions are subject to audit and cleared upon customer delivery cooling-offs.
              </p>

              <div className="pt-2 text-left" id="field-acceptedTerms">
                <label className="flex items-start space-x-3 text-xs text-gray-800 dark:text-zinc-300 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={() => setAcceptedTerms(!acceptedTerms)}
                    className="rounded text-[#0F9D58] focus:ring-[#0F9D58] border-gray-300 w-4 h-4 mt-0.5 cursor-pointer shrink-0"
                  />
                  <span className="font-bold leading-tight">
                    I agree to the Pak-Tajarat Affiliate Program Terms & Conditions. <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.acceptedTerms && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle size={12} />
                    {errors.acceptedTerms}
                  </p>
                )}
              </div>
            </div>
          </form>

          {/* Footer Action Buttons */}
          <div className="p-6 md:p-8 border-t border-gray-100 dark:border-zinc-800 shrink-0 flex flex-row space-x-4 bg-gray-50/50 dark:bg-zinc-950/25">
            <button 
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800/50 text-gray-600 dark:text-zinc-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              id="modal-cancel-btn"
            >
              Cancel / Close
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#0F9D58] hover:bg-[#0b8043] disabled:bg-[#0F9D58]/50 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center space-x-1.5"
              id="modal-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Terms & Conditions Modal Popup */}
      <AffiliateTermsModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
        onAccept={() => setAcceptedTerms(true)} 
      />
    </AnimatePresence>
  );
};
