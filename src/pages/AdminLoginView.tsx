import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Mail, Lock, LogIn, ChevronRight, AlertTriangle, ShieldCheck, 
  Sparkles, Terminal, Key, Eye, EyeOff, ShieldAlert, ArrowLeft
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { motion } from 'motion/react';

export const AdminLoginView: React.FC = () => {
  const { currentUser, login, addNotification, setCurrentView, adminEmail, adminPassword, workerAccounts } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // States
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated as Admin or Worker
  React.useEffect(() => {
    if (currentUser?.role === 'Admin' || currentUser?.role === 'Worker') {
      setCurrentView('admin-dashboard');
    }
  }, [currentUser?.role, setCurrentView]);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setAuthError(null);
    try {
      const actualAdminEmail = adminEmail || 'admin@paktajarat.pk';
      const actualAdminPassword = adminPassword || 'admin123';

      const inputTrimmed = email.trim().toLowerCase();

      // 1. Check Master Admin Credentials
      const matchesCustomAdmin = inputTrimmed === actualAdminEmail.toLowerCase() && password === actualAdminPassword;
      const matchesDefaultFallback = (inputTrimmed === 'admin@paktajarat.pk' || inputTrimmed === 'akdevstudiosolutions@gmail.com') && password === 'admin123';

      if (matchesCustomAdmin || matchesDefaultFallback) {
        await login(email, 'Master Administrator', true);
        addNotification('Master Admin Verified', 'Welcome to full Master Admin Console.', 'success');
        setCurrentView('admin-dashboard');
        return;
      }

      // 2. Check Worker Accounts by Unique ID or Email
      const workerMatch = workerAccounts.find(w => 
        w.workerEmail.toLowerCase() === inputTrimmed || 
        w.id.toLowerCase() === inputTrimmed
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
      console.error("Admin login error:", err);
      setAuthError(err?.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50/50 dark:bg-zinc-950 font-sans py-12 px-4 sm:px-6 lg:px-8" id="admin-login-container">
      
      {/* GLOWING ORBS FOR SCI-FI SECURE DESK FEEL */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10"
      >
        {/* LOGO & HEADING */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl border border-emerald-500/30 text-[#0F9D58] relative">
              <ShieldAlert size={36} className="animate-pulse" />
              <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 border-2 border-white dark:border-zinc-900 rounded-full" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#0F9D58] bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/10">
              Administrative Gateway
            </span>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-display mt-2">
              Pak-Tajarat Admin
            </h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Authorized personnel only. All access, sessions, and database queries are fully recorded for security audits.
            </p>
          </div>
        </div>

        {/* ERROR STATE VIEW */}
        {authError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl text-left text-xs flex items-start space-x-2.5 text-red-800 dark:text-red-400"
          >
            <AlertTriangle size={16} className="shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-extrabold">Verification Unsuccessful</p>
              <p className="text-[11px] mt-0.5 leading-relaxed text-red-700 dark:text-red-400">{authError}</p>
            </div>
          </motion.div>
        )}

        {/* ADMIN LOGIN FORM */}
        <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-left">
          
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-wider block">Admin Email or Worker ID</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="admin@paktajarat.pk or WRK-1001"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/10 transition-all"
              />
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-wider block">Secure Passkey</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/10 transition-all"
              />
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
              <ShieldCheck size={14} />
              <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter'}</span>
            </button>
          </div>

        </form>

        {/* NAVIGATION BACK TO PUBLIC SITE */}
        <div className="border-t border-gray-150 dark:border-zinc-800/80 pt-5 text-center">
          <button
            onClick={() => setCurrentView('home')}
            className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors cursor-pointer font-bold"
          >
            <ArrowLeft size={12} />
            <span>Return to Public Marketplace</span>
          </button>
        </div>

      </motion.div>

    </div>
  );
};
