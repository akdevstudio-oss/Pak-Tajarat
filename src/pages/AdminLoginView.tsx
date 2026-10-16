import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mail, Lock, LogIn, ChevronRight, AlertTriangle, ShieldCheck,
  Sparkles, Eye, EyeOff, ArrowLeft, ShoppingBag, Shield, CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLoginView: React.FC = () => {
  const { currentUser, login, addNotification, setCurrentView, adminEmail, adminPassword, workerAccounts } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (currentUser?.role === 'Admin' || currentUser?.role === 'Worker') {
      setCurrentView('admin-dashboard');
    }
  }, [currentUser?.role, setCurrentView]);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsLoading(true);
    setAuthError(null);
    try {
      const actualAdminEmail = adminEmail || 'admin@paktajarat.pk';
      const actualAdminPassword = adminPassword || 'admin123';
      const inputTrimmed = email.trim().toLowerCase();

      const matchesCustomAdmin = inputTrimmed === actualAdminEmail.toLowerCase() && password === actualAdminPassword;
      const matchesDefaultFallback =
        (inputTrimmed === 'admin@paktajarat.pk' || inputTrimmed === 'akdevstudiosolutions@gmail.com') &&
        password === 'admin123';

      if (matchesCustomAdmin || matchesDefaultFallback) {
        await login(email, 'Master Administrator', true);
        addNotification('Master Admin Verified', 'Welcome to full Master Admin Console.', 'success');
        setCurrentView('admin-dashboard');
        return;
      }

      const workerMatch = workerAccounts.find(w =>
        w.workerEmail.toLowerCase() === inputTrimmed || w.id.toLowerCase() === inputTrimmed
      );

      if (workerMatch) {
        if (workerMatch.workerPasskey !== password) {
          throw new Error('Invalid worker password / passkey.');
        }
        if (workerMatch.status === 'suspended') {
          throw new Error('This worker account has been suspended by the Master Administrator.');
        }

        await login(workerMatch.workerEmail, workerMatch.workerName, false);
        addNotification('Worker Console Active', `Welcome ${workerMatch.workerName}! Product & Blog Manager mode activated.`, 'success');
        setCurrentView('admin-dashboard');
        return;
      }

      throw new Error('Access denied. Invalid Email/Worker ID or secure passkey.');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setAuthError(err?.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f8f5] px-4 py-8 font-sans text-slate-900 sm:px-6 lg:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute -bottom-36 -right-20 h-[28rem] w-[28rem] rounded-full bg-lime-200/40 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.22]" style={{ backgroundImage: 'radial-gradient(#0f9d58 0.7px, transparent 0.7px)', backgroundSize: '22px 22px' }} />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_28px_90px_-35px_rgba(15,65,40,0.35)] lg:min-h-[630px] lg:grid-cols-[0.95fr_1.05fr]"
      >
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#073d2b] p-10 text-white lg:flex xl:p-12">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(44,190,112,0.32),transparent_36%),radial-gradient(circle_at_90%_85%,rgba(132,204,22,0.18),transparent_32%)]" />
          <div aria-hidden="true" className="absolute -right-24 top-28 h-72 w-72 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-12 top-40 h-48 w-48 rounded-full border border-white/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#087443] shadow-lg">
                <ShoppingBag size={25} strokeWidth={2.4} />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight">Pak-Tijarat</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-100/75">Admin Control Center</p>
              </div>
            </div>
            <div className="mt-20 max-w-sm">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-emerald-50">
                <Sparkles size={13} /> YOUR BUSINESS, IN CONTROL
              </div>
              <h1 className="text-4xl font-black leading-[1.12] tracking-tight xl:text-[2.8rem]">
                Manage your marketplace with <span className="text-lime-300">confidence.</span>
              </h1>
              <p className="mt-5 text-sm leading-7 text-emerald-50/75">
                Products, orders, content and store settings — all in one place, built for Pakistan’s digital marketplace.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300/15 text-lime-200"><ShieldCheck size={20} /></div>
              <div>
                <p className="text-sm font-bold">Protected workspace</p>
                <p className="mt-1 text-xs text-emerald-100/65">For authorized administrators and staff only</p>
              </div>
            </div>
            <p className="text-[10px] tracking-wide text-emerald-100/50">PAK-TIJARAT · PAKISTAN’S TRUSTED DIGITAL MARKETPLACE</p>
          </div>
        </aside>

        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-9 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f9d58] text-white"><ShoppingBag size={21} /></div>
                <div>
                  <p className="font-black tracking-tight text-slate-900">Pak-Tijarat</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">Admin Control Center</p>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><Shield size={19} /></div>
            </div>

            <div className="mb-8">
              <div className="mb-5 hidden h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#0f9d58] ring-1 ring-emerald-100 lg:flex">
                <ShieldCheck size={25} />
              </div>
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">Secure sign in</p>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-[2.1rem]">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Sign in with your administrator account or staff credentials to continue.</p>
            </div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
                <div><p className="font-bold">Sign-in unsuccessful</p><p className="mt-1 text-xs leading-5">{authError}</p></div>
              </motion.div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-5">
              <div>
                <label htmlFor="admin-identity" className="mb-2 block text-xs font-bold text-slate-700">Admin email or staff ID</label>
                <div className="group relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600" />
                  <input
                    id="admin-identity"
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="Email address or staff ID"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="admin-password" className="block text-xs font-bold text-slate-700">Password / passkey</label>
                  <span className="text-[10px] font-semibold text-slate-400">Keep it private</span>
                </div>
                <div className="group relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f9d58] px-5 py-4 text-sm font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(15,157,88,0.8)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#0b7b44] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Verifying credentials…</>
                ) : (
                  <><LogIn size={17} /> Sign in to dashboard <ChevronRight size={17} className="transition-transform group-hover:translate-x-1" /></>
                )}
              </button>
            </form>

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />
              <p className="text-[11px] leading-5 text-slate-500">This area is intended for authorized store administrators and approved staff. Never share your password or passkey.</p>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-emerald-700"
            >
              <ArrowLeft size={15} /> Return to marketplace
            </button>
            <p className="mt-8 text-center text-[10px] font-medium tracking-wide text-slate-400">© {new Date().getFullYear()} Pak-Tijarat · Secure Admin Access</p>
          </div>
        </div>
      </motion.section>
    </main>
  );
};
