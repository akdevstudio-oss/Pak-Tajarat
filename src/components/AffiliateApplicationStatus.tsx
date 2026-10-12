import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, ShieldCheck, ShieldAlert, ChevronLeft, Calendar, User, Phone, Mail, Globe, Sparkles, CheckCircle2 } from 'lucide-react';
import { AffiliateApplicationModal } from './AffiliateApplicationModal';

export const AffiliateApplicationStatus: React.FC = () => {
  const { currentAffiliateApplication, currentAffiliate, setActiveDashboardTab, setCurrentView } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!currentAffiliateApplication) {
    return (
      <div className="text-center py-12 space-y-4" id="no-application-state">
        <Clock className="mx-auto text-gray-400" size={48} />
        <h3 className="text-lg font-black text-gray-900 dark:text-white">No Application Found</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          You have not submitted an affiliate application yet. Join our program to earn generous payouts.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0F9D58] hover:bg-[#0b8043] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer"
        >
          Submit Application Now
        </button>

        <AffiliateApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    );
  }

  const {
    fullName,
    email,
    mobileNumber,
    country,
    previousAffiliateExperience,
    previousAffiliatePrograms,
    promotionMethods,
    otherPromotionMethod,
    reasonForJoining,
    estimatedMonthlySales,
    status,
    adminNotes,
    submittedAt
  } = currentAffiliateApplication;

  // Format submission date
  const submissionDate = submittedAt 
    ? new Date(submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Recently';

  // Determine active stepper step
  const getStepStatus = (stepIndex: number) => {
    if (status === 'Pending') {
      if (stepIndex === 1) return 'completed';
      if (stepIndex === 2) return 'current';
      return 'upcoming';
    }
    if (status === 'Approved') {
      return 'completed';
    }
    if (status === 'Rejected') {
      if (stepIndex === 1) return 'completed';
      if (stepIndex === 2) return 'completed';
      return 'failed';
    }
    return 'upcoming';
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300" id="affiliate-application-status-screen">
      
      {/* Header status block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span>Affiliate Application Status</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Tracking ID: <span className="font-mono text-gray-600 dark:text-gray-300 font-bold">{currentAffiliateApplication.uid}</span>
          </p>
        </div>

        {/* Status Badge */}
        <div className="self-start md:self-center">
          {status === 'Pending' && (
            <div className="bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Clock size={15} className="animate-pulse" />
              <span>Under Review</span>
            </div>
          )}
          {status === 'Approved' && (
            <div className="bg-green-50 dark:bg-green-950/25 border border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-400 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm animate-bounce">
              <ShieldCheck size={15} />
              <span>Approved & Activated</span>
            </div>
          )}
          {status === 'Rejected' && (
            <div className="bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <ShieldAlert size={15} />
              <span>Rejected</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Notes / Rejection Alert Block */}
      {status === 'Rejected' && (
        <div className="bg-red-50 dark:bg-zinc-950 border border-red-100 dark:border-red-900/30 p-6 rounded-[24px] space-y-3 shadow-inner">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="text-red-500 shrink-0" size={20} />
            <h3 className="font-extrabold text-sm text-red-900 dark:text-red-400 uppercase tracking-wide">
              Application Denied by Admin
            </h3>
          </div>
          <p className="text-xs text-red-700/80 dark:text-red-300/80 leading-relaxed font-medium">
            We regret to inform you that your application to join the Pak-Tajarat Affiliate Program has been declined at this time.
          </p>
          {adminNotes && (
            <div className="bg-red-100/40 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/20 p-4 rounded-xl text-xs text-red-800 dark:text-red-300 font-mono">
              <span className="font-extrabold block text-[10px] uppercase text-red-600 dark:text-red-400 mb-1">Feedback / Notes:</span>
              {adminNotes}
            </div>
          )}
          <div className="pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Update Details & Re-apply
            </button>
          </div>
        </div>
      )}

      {/* Approval Success Block */}
      {status === 'Approved' && (
        <div className="bg-emerald-50 dark:bg-zinc-950 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-[24px] space-y-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-emerald-500 shrink-0" size={20} />
            <h3 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-400 uppercase tracking-wide">
              Congratulations {fullName}! You are Approved!
            </h3>
          </div>
          <p className="text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed font-medium">
            Your application was reviewed and fully activated! Your referral code is ready, and you can now start sharing links to earn {currentAffiliate?.status === 'active' ? 'active' : 'high'} commissions.
          </p>
          <div className="pt-1">
            <button
              onClick={() => {
                setCurrentView('affiliate-portal');
              }}
              className="bg-[#0F9D58] hover:bg-[#0b8043] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Go to Affiliate Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Stepper Timeline Tracker */}
      <div className="p-6 bg-gray-50/50 dark:bg-zinc-950/15 border border-gray-100 dark:border-zinc-800 rounded-3xl space-y-5">
        <h3 className="text-xs font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest">
          Application Process Timeline
        </h3>

        {/* Visual Timeline Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Step 1 */}
          <div className="flex items-start md:flex-col gap-3 relative z-10 text-left">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-extrabold text-xs ${
              getStepStatus(1) === 'completed'
                ? 'bg-[#0F9D58] text-white'
                : 'bg-gray-200 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
            }`}>
              {getStepStatus(1) === 'completed' ? '✓' : '1'}
            </div>
            <div className="md:mt-2 space-y-0.5">
              <h4 className="font-black text-xs text-gray-900 dark:text-white uppercase">Application Submitted</h4>
              <p className="text-[10px] text-gray-400 font-mono">Date: {submissionDate}</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start md:flex-col gap-3 relative z-10 text-left">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-extrabold text-xs ${
              getStepStatus(2) === 'completed'
                ? 'bg-[#0F9D58] text-white'
                : getStepStatus(2) === 'current'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-200 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
            }`}>
              {getStepStatus(2) === 'completed' ? '✓' : '2'}
            </div>
            <div className="md:mt-2 space-y-0.5">
              <h4 className="font-black text-xs text-gray-900 dark:text-white uppercase">Under Review</h4>
              <p className="text-[10px] text-gray-400 font-medium">
                {status === 'Pending' ? 'Our agents are verifying details' : 'Review completed'}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start md:flex-col gap-3 relative z-10 text-left">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-extrabold text-xs ${
              getStepStatus(3) === 'completed'
                ? 'bg-[#0F9D58] text-white'
                : getStepStatus(3) === 'failed'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
            }`}>
              {getStepStatus(3) === 'completed' ? '✓' : getStepStatus(3) === 'failed' ? '✕' : '3'}
            </div>
            <div className="md:mt-2 space-y-0.5">
              <h4 className="font-black text-xs text-gray-900 dark:text-white uppercase">Account Activation</h4>
              <p className="text-[10px] text-gray-400 font-medium">
                {status === 'Pending' ? 'Approval decision pending' : status === 'Approved' ? 'Activated!' : 'Declined'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary of submitted details */}
      <div className="border border-gray-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950">
        <div className="p-5 bg-gray-50/50 dark:bg-zinc-950/25 border-b border-gray-100 dark:border-zinc-800 flex items-center space-x-2">
          <Calendar size={16} className="text-[#0F9D58]" />
          <h3 className="font-extrabold text-xs text-gray-800 dark:text-zinc-200 uppercase tracking-wider">
            Your Submitted Application Details
          </h3>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Section 1: Personal */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-zinc-900 pb-1 flex items-center gap-1">
              <User size={12} />
              <span>Personal Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-gray-400 font-medium">Full Name:</span>
                <p className="font-bold text-gray-800 dark:text-zinc-300">{fullName}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-gray-400 font-medium">Email Address:</span>
                <p className="font-bold text-gray-800 dark:text-zinc-300">{email}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-gray-400 font-medium">Mobile Number:</span>
                <p className="font-bold text-gray-800 dark:text-zinc-300 font-mono">{mobileNumber}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-gray-400 font-medium">Country of Residence:</span>
                <p className="font-bold text-gray-800 dark:text-zinc-300">{country}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Experience & Promotion */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-zinc-900 pb-1 flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>Experience & Promotion</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-gray-400 font-medium">Previous Affiliate Experience:</span>
                <p className="font-bold text-gray-800 dark:text-zinc-300">
                  {previousAffiliateExperience ? 'Yes' : 'No'}
                </p>
              </div>
              {previousAffiliateExperience && previousAffiliatePrograms && (
                <div className="space-y-0.5 col-span-1 sm:col-span-2">
                  <span className="text-gray-400 font-medium">Worked Programs:</span>
                  <p className="font-bold text-gray-800 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-900 p-3 rounded-xl">
                    {previousAffiliatePrograms}
                  </p>
                </div>
              )}
              <div className="space-y-1 col-span-1 sm:col-span-2">
                <span className="text-gray-400 font-medium block">Promotion Methods:</span>
                <div className="flex flex-wrap gap-2">
                  {promotionMethods.map((method, idx) => (
                    <span 
                      key={`${method}-${idx}`}
                      className="bg-emerald-500/10 text-[#0F9D58] font-bold text-[10px] px-2.5 py-1 rounded-full border border-[#0F9D58]/10"
                    >
                      {method}
                    </span>
                  ))}
                  {promotionMethods.includes('Other') && otherPromotionMethod && (
                    <span className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 font-bold text-[10px] px-2.5 py-1 rounded-full">
                      Custom: {otherPromotionMethod}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-0.5 sm:col-span-2">
                <span className="text-gray-400 font-medium">Estimated Monthly Sales Volume:</span>
                <p className="font-bold text-gray-800 dark:text-zinc-300">{estimatedMonthlySales}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Motivation */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-50 dark:border-zinc-900 pb-1 flex items-center gap-1">
              <Globe size={12} />
              <span>Motivation & Promotional Strategy</span>
            </h4>
            <div className="text-xs space-y-1.5 bg-gray-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-gray-100 dark:border-zinc-900">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Motivation Letter:</span>
              <p className="text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
                {reasonForJoining}
              </p>
            </div>
          </div>
        </div>
      </div>

      <AffiliateApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
