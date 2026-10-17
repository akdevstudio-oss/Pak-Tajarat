import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Mail, Lock, User, Phone, LogIn, ChevronRight, CheckCircle2, 
  Shield, AlertTriangle, ShieldCheck, TrendingUp, Award, Sparkles,
  Building2, HelpCircle, ArrowRight, RefreshCw, Check
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { motion, AnimatePresence } from 'motion/react';

export const AuthView: React.FC = () => {
  const { login, loginWithGoogle, loginAnonymously, registerUser, sendPasswordReset, addNotification, setCurrentView } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Modals / operational flow controls
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingUserReg, setPendingUserReg] = useState<{ email: string; fullName: string; phone: string } | null>(null);

  // Error and Loading states
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const isSpecialAdmin = email.toLowerCase() === 'admin@paktajarat.pk' || email.toLowerCase() === 'akdevstudiosolutions@gmail.com';
    
    if (isSpecialAdmin) {
      setAuthError('Administrators must sign in through the secure portal. Please visit /admin to authenticate.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      await login(email, email.split('@')[0], false, password);
      setCurrentView('home');
    } catch (err: any) {
      console.error("Login submission error:", err);
      let errMsg = err?.message || String(err);
      if (errMsg.includes('admin-restricted-operation')) {
        setAuthError('admin-restricted-operation');
      } else {
        setAuthError(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !password) return;
    setIsLoading(true);
    setAuthError(null);
    try {
      await registerUser(email.trim(), fullName.trim(), phone.trim(), password);
      addNotification('Account Created', 'Your account has been created successfully.', 'success');
      setActiveTab('login');
      setCurrentView('home');
    } catch (err: any) {
      setAuthError(err?.message || 'Account registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length >= 4 && pendingUserReg) {
      setIsLoading(true);
      setAuthError(null);
      try {
        await registerUser(pendingUserReg.email, pendingUserReg.fullName, pendingUserReg.phone, password);
        addNotification('Verification Successful', 'Your email has been verified successfully and account has been created.', 'success');
        setShowOtpModal(false);
        setPendingUserReg(null);
        setOtpCode('');
        setCurrentView('home');
      } catch (err: any) {
        console.error("Verification registration error:", err);
        let errMsg = err?.message || String(err);
        setAuthError(errMsg);
        setShowOtpModal(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail.trim()) {
      setIsLoading(true);
      try {
        await sendPasswordReset(forgotEmail.trim());
        setForgotSuccess(true);
      } catch (err: any) {
        setAuthError(err?.message || 'Password reset is unavailable. Please contact support.');
        setForgotSuccess(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
      const pendingRole = localStorage.getItem('pending_login_role');
      if (pendingRole === 'Admin') {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('home');
      }
    } catch (err: any) {
      console.warn("Google sign in is unavailable:", err);
      setAuthError(err?.message || 'Google sign-in is not configured. Please use email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await loginAnonymously();
      setCurrentView('home');
    } catch (err: any) {
      console.error("Anonymous sign in error:", err);
      setAuthError(err?.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-[#0a0a0c] font-sans overflow-hidden" id="auth-view-container">
      
      {/* Decorative Glowing Greenery Orbs */}
      <div className="absolute top-1/3 left-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-80 h-80 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

      {/* LEFT COLUMN: GORGEOUS FORM SIDE with Glassmorphic dark design */}
      <div className="w-full lg:w-[48%] xl:w-[44%] bg-zinc-950 text-white flex flex-col justify-between p-6 sm:p-10 md:p-14 overflow-y-auto min-h-screen relative z-10 border-r border-zinc-900 shadow-2xl">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView('home')}>
            <Logo size={42} showText={false} variant="icon" />
            <span className="font-display font-black tracking-wider text-sm text-emerald-100 uppercase">
              PAK TAJARAT
            </span>
          </div>
          
          <div className="flex items-center space-x-1.5 bg-emerald-950/40 border border-emerald-800/20 px-3 py-1 rounded-full text-[10px] text-emerald-300 font-bold tracking-widest uppercase">
            <Sparkles size={10} className="text-[#0F9D58] animate-pulse" />
            <span>Secure SSL Port</span>
          </div>
        </div>

        {/* Form Body Wrap */}
        <div className="my-auto py-10 max-w-md w-full mx-auto space-y-7">
          
          {/* Welcome Text */}
          <div className="text-left space-y-2">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display"
            >
              {activeTab === 'login' ? 'Welcome Back!' : 'Create Customer Account'}
            </motion.h1>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              {activeTab === 'login' 
                ? 'Access Pakistan’s premier shopping catalog, place instant orders, and track your deliveries.' 
                : 'Join the trusted shopping corridor for premium clothing, gadgets, home goods, and more.'}
            </p>
          </div>

          {authError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl text-left text-xs text-red-800 dark:text-red-400 flex items-start space-x-2">
              <AlertTriangle size={16} className="shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold text-red-950 dark:text-red-300">Authentication Failed</p>
                <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">{authError}</p>
              </div>
            </div>
          )}

          {/* Tab Slide Selector */}
          <div className="relative flex p-1.5 bg-zinc-900 rounded-2xl border border-zinc-850">
            {/* Sliding backdrop */}
            <div 
              className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-[#0F9D58] rounded-xl shadow-md transition-all duration-300 ease-out ${
                activeTab === 'register' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 text-center font-extrabold text-[11px] uppercase tracking-wider relative z-10 transition-colors cursor-pointer ${
                activeTab === 'login' ? 'text-white font-black' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 text-center font-extrabold text-[11px] uppercase tracking-wider relative z-10 transition-colors cursor-pointer ${
                activeTab === 'register' ? 'text-white font-black' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* SOCIAL LOGINS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="py-3 px-3 border border-zinc-850 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 text-zinc-300 bg-zinc-900 hover:bg-zinc-800 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Google SSO'}</span>
            </button>

            <button
              type="button"
              onClick={handleAnonymousLogin}
              disabled={isLoading}
              className="py-3 px-3 border border-zinc-850 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 text-zinc-300 bg-zinc-900 hover:bg-[#0F9D58]/10 hover:border-emerald-500/30 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <User size={14} className="text-[#0F9D58]" />
              <span>{isLoading ? 'Connecting...' : 'Guest Browse'}</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-850"></div>
            <span className="flex-shrink mx-4 text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Or enter email details</span>
            <div className="flex-grow border-t border-zinc-850"></div>
          </div>

          {/* MAIN FORMS */}
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLoginSubmit} 
                className="space-y-4 text-left"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/10 transition-all"
                    />
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(true);
                        setForgotSuccess(false);
                      }}
                      className="text-[10px] text-[#0F9D58] hover:underline font-extrabold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/10 transition-all"
                    />
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                >
                  <LogIn size={14} />
                  <span>{isLoading ? 'Verifying Credentials...' : 'Sign In To Account'}</span>
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="register-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegisterSubmit} 
                className="space-y-4 text-left"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Imran Khan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/10 transition-all"
                    />
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="imran@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/10 transition-all"
                    />
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="e.g. 03001234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/10 transition-all"
                    />
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">Set Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/10 transition-all"
                    />
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Verify & Setup Account'}</span>
                  <ChevronRight size={14} />
                </button>
              </motion.form>
            )}
          </AnimatePresence>

        </div>

        {/* Footer Brand Details */}
        <div className="flex flex-wrap items-center justify-between text-[10px] text-gray-500 font-mono mt-4 pt-6 border-t border-zinc-850">
          <span>© 2026 PAK-TAJARAT</span>
          <div className="flex space-x-3 mt-1 sm:mt-0">
            <span className="hover:underline cursor-pointer">Security Code</span>
            <span className="hover:underline cursor-pointer">Service Terms</span>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: PREMIUM DESIGN COMPOSITION (SPLIT VIEW HERO) */}
      <div className="hidden lg:flex flex-col justify-between flex-1 relative bg-gradient-to-br from-zinc-950 via-[#041a0e] to-[#010a05] p-12 xl:p-16 overflow-hidden">
        
        {/* Subtle decorative glowing background shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/20 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/15 blur-[110px] pointer-events-none" />
        <div className="absolute top-[30%] left-[30%] w-[350px] h-[350px] rounded-full bg-[#0F9D58]/15 blur-[90px] pointer-events-none" />
        
        {/* Top visual row */}
        <div className="relative flex items-center justify-between z-10">
          <div className="flex items-center space-x-2.5">
            <div className="h-2 w-2 rounded-full bg-[#0F9D58] animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black">
              PAKISTAN PREMIUM NETWORK ACTIVE
            </span>
          </div>
          
          <div className="text-[10px] text-zinc-500 font-mono tracking-wider">
            SERVER IP: 172.64.2.9
          </div>
        </div>

        {/* Middle Visual Stage */}
        <div className="relative my-auto space-y-12 max-w-xl z-10 text-left">
          
          {/* Main Title paired nicely */}
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs text-emerald-400 font-extrabold font-display">
              <Building2 size={12} />
              <span>Premium Shopping & Distribution</span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight font-display tracking-tight">
              Pakistan's Premier <span className="text-[#0F9D58] drop-shadow-[0_2px_10px_rgba(15,157,88,0.25)]">E-Commerce</span> Commerce Hub
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              Pakistan's trusted digital marketplace. Buy verified apparel, custom sportswear, manufacturing goods, and consumer retail items with full escrow protection.
            </p>
          </div>

          {/* DYNAMIC FLOATING WIDGETS (Dribbble composition) */}
          <div className="space-y-4 relative">
            
            {/* Widget A: Escrow Verification */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="p-4 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-xl flex items-start space-x-4 max-w-md cursor-pointer hover:border-[#0F9D58]/50 transition-colors"
            >
              <div className="p-2.5 bg-[#0F9D58]/10 text-[#0F9D58] rounded-xl shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-white text-sm">Verified SECP Trade Escrow</p>
                <p className="text-zinc-400 mt-1 leading-normal">
                  All transaction payments remain protected inside our escrow vaults until shipping validation is received from the distributor.
                </p>
              </div>
            </motion.div>

            {/* Widget B: Real-time traffic map pin / B2B corridor (Offset to look stunning) */}
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="p-4 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-xl flex items-start space-x-4 max-w-md ml-8 cursor-pointer hover:border-[#0F9D58]/50 transition-colors"
            >
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl shrink-0">
                <TrendingUp size={20} />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-white text-sm">Karachi-Lahore Trade Corridor</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono text-emerald-400 font-bold bg-[#0F9D58]/10 px-1.5 py-0.5 rounded text-[10px]">+184,200</span>
                  <span className="text-zinc-400">active container logs verified today</span>
                </div>
              </div>
            </motion.div>

            {/* Widget C: Verified Sellers Badge */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
              className="p-4 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-xl flex items-start space-x-4 max-w-md cursor-pointer hover:border-[#0F9D58]/50 transition-colors"
            >
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl shrink-0">
                <Award size={20} />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-white text-sm">100% Tax Compliant Directory</p>
                <p className="text-zinc-400 mt-1 leading-normal">
                  Instant integration with Pakistan Revenue authorities (FBR) to fetch NTN certificates and sales tax invoice credits directly.
                </p>
              </div>
            </motion.div>

          </div>

        </div>

        {/* Bottom trust row */}
        <div className="relative pt-6 border-t border-zinc-800/80 flex items-center justify-between z-10 text-left">
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider font-display">Over 10,000+ Enterprises</p>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Verified industrial buyers across major economic hubs.</p>
          </div>
          <div className="flex -space-x-2 overflow-hidden">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="inline-block h-7 w-7 rounded-full ring-2 ring-zinc-950 bg-zinc-800 text-center flex items-center justify-center text-[10px] font-bold text-gray-300">
                {num === 1 ? 'K' : num === 2 ? 'L' : num === 3 ? 'I' : 'F'}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL 1: Forgot Password Portal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 text-left space-y-4 shadow-2xl"
          >
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Recover B2B Account</h3>
            
            {forgotSuccess ? (
              <div className="space-y-4 text-center py-4">
                <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-950/30 text-[#0F9D58] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">Self-service password reset is not available yet. Please use the Contact page to reach Pak-Tijarat support.</p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="w-full bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-extrabold text-xs uppercase py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-gray-400 leading-relaxed">Self-service password reset is not configured yet. You can contact support for account recovery.</p>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase block">Your Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. imran@gmail.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58]"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#0F9D58] hover:bg-[#0B7B44] text-white rounded-xl text-xs font-bold shadow cursor-pointer"
                  >
                    Send Recovery
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* MODAL 2: Simulated OTP Verification */}
      {showOtpModal && pendingUserReg && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 text-left space-y-4 shadow-2xl"
          >
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Security OTP Verification</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              This email verification flow is not enabled. Please use the registration form to create your account.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase block">4-Digit Security Code</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="1234"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl text-center py-3.5 font-bold font-mono tracking-widest text-lg text-gray-800 dark:text-white focus:outline-none focus:border-[#0F9D58]"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setPendingUserReg(null);
                  }}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpCode.length < 4}
                  className="flex-1 py-2.5 bg-[#0F9D58] hover:bg-[#0B7B44] text-white rounded-xl text-xs font-bold shadow disabled:opacity-50 cursor-pointer"
                >
                  Verify Email
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
