import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface AffiliateTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const AffiliateTermsModal: React.FC<AffiliateTermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
        id="affiliate-terms-modal-overlay"
      >
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Content Window */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white dark:bg-zinc-900 w-full max-w-3xl h-[85vh] md:h-[80vh] rounded-[28px] md:rounded-[36px] shadow-2xl flex flex-col border border-gray-100 dark:border-zinc-800 text-left overflow-hidden z-10"
          id="affiliate-terms-modal-window"
        >
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-gradient-to-r from-emerald-950/5 via-emerald-900/10 to-emerald-950/5 dark:from-emerald-950/20 dark:to-zinc-900">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0F9D58]/10 text-[#0F9D58] flex items-center justify-center font-bold shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white" id="terms-modal-header-title">
                  Pak-Tajarat Affiliate Program – Terms & Conditions
                </h2>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
                  Last Updated: July 2026
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-500 dark:text-gray-300 transition-colors shrink-0 cursor-pointer"
              id="terms-modal-close-btn"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Subheader summary box */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 px-6 md:px-8 py-3 text-xs text-emerald-900 dark:text-emerald-300 font-medium leading-relaxed">
            Welcome to the Pak-Tajarat Affiliate Program. By submitting your application and participating in this program, you agree to the following Terms & Conditions.
          </div>

          {/* Scrollable Terms Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-sans" id="terms-modal-body">
            
            {/* Section 1 */}
            <section className="space-y-2">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                <span className="text-[#0F9D58] font-mono">1.</span> Eligibility
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must be at least 18 years of age.</li>
                <li>You must provide accurate, complete, and up-to-date information during registration.</li>
                <li>Pak-Tajarat reserves the right to approve or reject any affiliate application without prior notice or explanation.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                <span className="text-[#0F9D58] font-mono">2.</span> Affiliate Application
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Submitting an application does not guarantee approval.</li>
                <li>All applications are manually reviewed by the Pak-Tajarat team.</li>
                <li>Providing false, misleading, or incomplete information may result in rejection or permanent suspension.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                <span className="text-[#0F9D58] font-mono">3.</span> Affiliate Account
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Each individual is allowed to maintain only one affiliate account unless written permission is granted by Pak-Tajarat.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You must immediately notify Pak-Tajarat if you suspect unauthorized access to your account.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                <span className="text-[#0F9D58] font-mono">4.</span> Referral Links
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Every approved affiliate will receive a unique referral link and referral code.</li>
                <li>Commissions are tracked only when customers purchase through your official referral link.</li>
                <li>Referral links must not be modified, manipulated, or used in any fraudulent manner.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <h3 className="text-sm font-black text-[#0F9D58] flex items-center gap-2 border-b border-emerald-200/50 dark:border-emerald-800/50 pb-1.5">
                <span className="font-mono">5.</span> Commission Policy
              </h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Commission is paid <strong className="text-gray-900 dark:text-white">only on successfully delivered orders</strong> placed through your referral link.</li>
                <li>No commission will be paid for clicks, account registrations, abandoned carts, cancelled orders, or failed payments.</li>
                <li>After an order is marked as <strong className="text-gray-900 dark:text-white">Delivered</strong>, the commission will remain in <strong className="text-amber-600 dark:text-amber-400">Pending</strong> status for <strong className="text-gray-900 dark:text-white">7 days</strong>.</li>
                <li>The 7-day period is reserved for possible returns, refunds, or cancellations.</li>
                <li>If the order is <strong className="text-gray-900 dark:text-white">not returned, refunded, or cancelled within 7 days after delivery</strong>, the commission will automatically become <strong className="text-[#0F9D58]">Approved</strong>.</li>
                <li>Approved commission will be added to your <strong className="text-gray-900 dark:text-white">Available Balance</strong>.</li>
                <li>Only Approved commissions are eligible for withdrawal.</li>
                <li>If an order is returned, refunded, or cancelled within the 7-day period, the related commission will be automatically cancelled or reversed.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-2">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                <span className="text-[#0F9D58] font-mono">6.</span> Withdrawal Policy
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>The minimum withdrawal amount is <strong className="text-gray-900 dark:text-white">Rs. 1,000</strong> (or any amount set by Pak-Tajarat).</li>
                <li>Withdrawal requests can only be submitted using your <strong className="text-gray-900 dark:text-white">Approved Available Balance</strong>.</li>
                <li>Pak-Tajarat will process approved withdrawal requests through the selected payment method.</li>
                <li>Incorrect payment details may delay or cancel your payment.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-2">
              <h3 className="text-sm font-black text-red-600 dark:text-red-400 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                <span className="font-mono">7.</span> Prohibited Activities
              </h3>
              <p className="font-medium text-gray-600 dark:text-gray-400">The following activities are strictly prohibited:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Creating fake orders.</li>
                <li>Purchasing through your own referral link to earn commission.</li>
                <li>Creating multiple affiliate accounts.</li>
                <li>Sending spam messages or unsolicited promotions.</li>
                <li>Using bots, automated traffic, or fake clicks.</li>
                <li>Misleading customers or making false claims.</li>
                <li>Any activity intended to manipulate the affiliate system.</li>
              </ul>
              <p className="text-[11px] text-red-500 font-bold pt-1">
                Violation of these rules may result in immediate account suspension, cancellation of commissions, and permanent removal from the program.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-2">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                <span className="text-[#0F9D58] font-mono">8.</span> Marketing Guidelines
              </h3>
              <p className="font-medium text-gray-600 dark:text-gray-400">Affiliates may promote Pak-Tajarat through:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Facebook</li>
                <li>Instagram</li>
                <li>TikTok</li>
                <li>YouTube</li>
                <li>WhatsApp</li>
                <li>Blogs</li>
                <li>Websites</li>
                <li>Email Marketing (where legally permitted)</li>
              </ul>
              <p className="font-medium text-gray-600 dark:text-gray-400 pt-2">Affiliates must not:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use misleading advertisements.</li>
                <li>Pretend to represent Pak-Tajarat officially.</li>
                <li>Use copyrighted material without permission.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="space-y-2">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                <span className="text-[#0F9D58] font-mono">9.</span> Account Suspension
              </h3>
              <p>
                Pak-Tajarat reserves the right to suspend or permanently terminate an affiliate account if fraudulent, abusive, or policy-violating activity is detected. Any unpaid commission earned through prohibited activities may be cancelled.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-2">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                <span className="text-[#0F9D58] font-mono">10.</span> Privacy
              </h3>
              <p>Your personal information will be used only for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Affiliate account management.</li>
                <li>Commission calculation.</li>
                <li>Payment processing.</li>
                <li>Legal and security purposes.</li>
              </ul>
              <p>Pak-Tajarat will not sell your personal information to third parties except where required by law.</p>
            </section>

            {/* Section 11 */}
            <section className="space-y-2">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                <span className="text-[#0F9D58] font-mono">11.</span> Changes to the Program
              </h3>
              <p>
                Pak-Tajarat reserves the right to update these Terms & Conditions, commission rates, payment policies, or program rules at any time. Updated terms will apply from the date they are published.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-2">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-1.5">
                <span className="text-[#0F9D58] font-mono">12.</span> Governing Law
              </h3>
              <p>
                These Terms & Conditions are governed by the laws of the <strong className="text-gray-900 dark:text-white">Islamic Republic of Pakistan</strong>. Any disputes shall be subject to the jurisdiction of the competent courts of Pakistan.
              </p>
            </section>

            {/* Section 13 */}
            <section className="space-y-2 bg-gray-50 dark:bg-zinc-950/60 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-1.5">
                <span className="text-[#0F9D58] font-mono">13.</span> Acceptance & Confirmation
              </h3>
              <p className="font-semibold text-gray-800 dark:text-gray-200">By selecting "I Agree" and submitting the Affiliate Application Form, you confirm that:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You have read and understood these Terms & Conditions.</li>
                <li>You agree to follow all Affiliate Program policies.</li>
                <li>You understand that commissions are paid <strong className="text-gray-900 dark:text-white">only for successfully delivered orders</strong>.</li>
                <li>You understand that commissions remain <strong className="text-amber-600 dark:text-amber-400">Pending for 7 days after delivery</strong>.</li>
                <li>You understand that if the order is <strong className="text-gray-900 dark:text-white">not returned, refunded, or cancelled within 7 days</strong>, the commission will automatically become <strong className="text-[#0F9D58]">Approved</strong>.</li>
                <li>You understand that <strong className="text-[#0F9D58]">only Approved commissions can be withdrawn</strong> after meeting the minimum withdrawal requirement.</li>
                <li>You agree that any fraudulent activity may result in account suspension, commission cancellation, or permanent removal from the Affiliate Program.</li>
              </ul>
            </section>

          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-950/25 flex items-center justify-between gap-4">
            <span className="text-[10px] text-gray-400 font-mono">Pak-Tajarat Legal Terms v2026</span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
              >
                Close
              </button>
              {onAccept && (
                <button
                  onClick={() => {
                    onAccept();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#0F9D58] hover:bg-[#0b8043] text-white text-xs font-black shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={16} />
                  <span>I Agree & Accept</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
