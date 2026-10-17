import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, WorkerAccount } from '../../shared/types';
import { useUI } from '../ui/UIContext';

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, fullName: string, isAdmin?: boolean, password?: string) => Promise<void>;
  loginWithPassword: (email: string, password?: string) => Promise<void>;
  registerWithPassword: (email: string, password?: string, fullName?: string, phone?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
  registerUser: (email: string, fullName: string, phone: string, password?: string) => Promise<void>;
  updateProfile: (fullName: string, phone: string, addresses: any[]) => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
async function authRequest(action: string, body: Record<string, unknown> = {}) {
  const response = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action, ...body }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || 'Authentication service is unavailable.');
  return data;
}
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification, workerAccounts, setCurrentView } = useUI();
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try { const saved = localStorage.getItem('pak_tajarat_current_user'); return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const userRef = useRef<User | null>(currentUser);
  useEffect(() => { userRef.current = currentUser; if (currentUser) localStorage.setItem('pak_tajarat_current_user', JSON.stringify(currentUser)); else localStorage.removeItem('pak_tajarat_current_user'); }, [currentUser]);
  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => { if (active && data?.ok && data.user) setCurrentUser(data.user); }).catch(() => {});
    return () => { active = false; };
  }, []);
  const login = async (email: string, fullName: string, isAdmin = false, password?: string) => {
    const normalized = email.trim().toLowerCase();
    const worker = workerAccounts.find((w: WorkerAccount) => w.workerEmail.toLowerCase() === normalized || w.id.toLowerCase() === normalized);
    if (worker) {
      if (worker.status === 'suspended') throw new Error('Worker account suspended. Please contact the administrator.');
      if (!password || worker.workerPasskey !== password) throw new Error('Invalid worker ID/email or passkey.');
      const workerUser: User = { id: worker.id, email: worker.workerEmail, fullName: worker.workerName, role: 'Worker', workerPermissions: worker.allowedModules, workerId: worker.id, phone: '' };
      setCurrentUser(workerUser); addNotification('Worker Access Granted', 'Role-restricted access active.', 'success'); return;
    }
    if (isAdmin) {
      const response = await fetch('/api/admin/session', { credentials: 'include', cache: 'no-store' });
      const session = await response.json().catch(() => ({}));
      if (!response.ok || !session?.authenticated) throw new Error('Administrator session is not authenticated.');
      const user: User = { id: 'admin-' + normalized, email: normalized, fullName: fullName || 'Administrator', role: 'Admin', addresses: [], phone: '' };
      setCurrentUser(user); return;
    }
    if (!password) throw new Error('Please enter your password.');
    const result = await authRequest('login', { email: normalized, password });
    setCurrentUser(result.user); addNotification('Login Successful', 'Welcome back!', 'success');
  };
  const loginWithPassword = async (email: string, password?: string) => login(email, email.split('@')[0], false, password);
  const registerUser = async (email: string, fullName: string, phone: string, password?: string) => {
    if (!password || password.length < 8) throw new Error('Password must contain at least 8 characters.');
    const result = await authRequest('register', { email: email.trim().toLowerCase(), fullName, phone, password });
    setCurrentUser(result.user); addNotification('Registration Successful', 'Your account has been created.', 'success');
  };
  const registerWithPassword = async (email: string, password?: string, fullName?: string, phone?: string) => registerUser(email, fullName || email.split('@')[0], phone || '', password);
  const sendPasswordReset = async (_email: string) => { throw new Error('Password reset email is not configured yet. Please contact support; no reset email was sent.'); };
  const loginWithGoogle = async () => { throw new Error('Google sign-in is not configured yet. Please use email and password to sign in.'); };
  const loginAnonymously = async () => {
    const guest: User = { id: 'guest-' + crypto.randomUUID(), email: 'guest@paktajarat.pk', fullName: 'Pak Shopper (Guest)', role: 'User', addresses: [], phone: '' };
    setCurrentUser(guest); addNotification('Guest Mode Activated', 'Browsing as guest.', 'success');
  };
  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    try { await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }); } catch {}
    setCurrentUser(null); setCurrentView('home'); addNotification('Logged Out', 'You have been logged out.', 'info');
  };
  const updateProfile = async (fullName: string, phone: string, addresses: any[]) => {
    if (!currentUser) return;
    const response = await fetch('/api/auth/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ fullName, phone, addresses }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.error || 'Profile could not be saved.');
    setCurrentUser(data.user); addNotification('Profile Updated', 'Your profile has been saved.', 'success');
  };
  return <AuthContext.Provider value={{ currentUser, login, loginWithPassword, registerWithPassword, sendPasswordReset, loginWithGoogle, loginAnonymously, logout, registerUser, updateProfile }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within an AuthProvider'); return context; };
