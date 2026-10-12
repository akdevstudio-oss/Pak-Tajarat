import React, { useState } from 'react';
import { WorkerAccount } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Users, ShieldCheck, ShieldAlert, Plus, Search, Key, Eye, EyeOff, 
  Trash2, RefreshCw, CheckCircle, Ban, Copy, Lock, UserPlus, Sparkles, X, Edit3, Shield
} from 'lucide-react';

export const WorkerManagementCMS: React.FC = () => {
  const { 
    workerAccounts, 
    addWorkerAccount, 
    updateWorkerAccountStatus, 
    deleteWorkerAccount, 
    updateWorkerAccountPassword,
    addNotification 
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'suspended'>('All');

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetPasskeyModalOpen, setResetPasskeyModalOpen] = useState<WorkerAccount | null>(null);
  
  // Passkey visibility map by worker ID
  const [visiblePasskeys, setVisiblePasskeys] = useState<Record<string, boolean>>({});

  // New Worker Form State
  const [wId, setWId] = useState(`WRK-${Math.floor(1000 + Math.random() * 9000)}`);
  const [wName, setWName] = useState('');
  const [wEmail, setWEmail] = useState('');
  const [wPasskey, setWPasskey] = useState('');
  const [wStatus, setWStatus] = useState<'active' | 'suspended'>('active');
  const [wProductsAllowed, setWProductsAllowed] = useState(true);
  const [wBlogsAllowed, setWBlogsAllowed] = useState(true);

  // New Passkey State for edit modal
  const [newPasskeyInput, setNewPasskeyInput] = useState('');

  const togglePasskeyVisibility = (workerId: string) => {
    setVisiblePasskeys(prev => ({
      ...prev,
      [workerId]: !prev[workerId]
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addNotification('Copied to Clipboard', `${label} (${text}) copied!`, 'success');
  };

  const handleOpenCreateModal = () => {
    setWId(`WRK-${Math.floor(1000 + Math.random() * 9000)}`);
    setWName('');
    setWEmail('');
    setWPasskey(`wrkpass${Math.floor(100 + Math.random() * 900)}`);
    setWStatus('active');
    setWProductsAllowed(true);
    setWBlogsAllowed(true);
    setCreateModalOpen(true);
  };

  const handleCreateWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wId.trim() || !wName.trim() || !wEmail.trim() || !wPasskey.trim()) {
      addNotification('Missing Information', 'Please fill in Worker ID, Name, Email, and Passkey.', 'warning');
      return;
    }

    const allowedModules: ('products' | 'blogs')[] = [];
    if (wProductsAllowed) allowedModules.push('products');
    if (wBlogsAllowed) allowedModules.push('blogs');

    if (allowedModules.length === 0) {
      addNotification('Select Permission', 'Worker must be granted at least Product or Blog management access.', 'warning');
      return;
    }

    await addWorkerAccount({
      id: wId.trim().toUpperCase(),
      workerName: wName.trim(),
      workerEmail: wEmail.trim().toLowerCase(),
      workerPasskey: wPasskey.trim(),
      allowedModules,
      status: wStatus,
      assignedBy: 'Master Admin'
    });

    setCreateModalOpen(false);
  };

  const handleSaveNewPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasskeyModalOpen || !newPasskeyInput.trim()) return;

    await updateWorkerAccountPassword(resetPasskeyModalOpen.id, newPasskeyInput.trim());
    setResetPasskeyModalOpen(null);
    setNewPasskeyInput('');
  };

  // Filter Workers
  const filteredWorkers = workerAccounts.filter(w => {
    const matchesSearch = 
      w.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.workerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalWorkers = workerAccounts.length;
  const activeWorkers = workerAccounts.filter(w => w.status === 'active').length;
  const suspendedWorkers = workerAccounts.filter(w => w.status === 'suspended').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-emerald-950/40 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold mb-2">
            <Shield size={14} />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Worker Staff Accounts & Access Control</span>
            <span className="text-xs font-normal text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-lg">ورکرز کی معلومات اور سیکورٹی</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Create unique worker IDs and passkeys for your staff. Workers can log in to upload products and publish blogs without gaining access to financial reports, user orders, or system settings.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-black text-xs px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus size={16} />
          <span>+ Create Worker Account / نیا ورکر بنائیں</span>
        </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Registered Workers</p>
            <h3 className="text-2xl font-black text-white font-mono mt-0.5">{totalWorkers}</h3>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Active Authorized Staff</p>
            <h3 className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{activeWorkers}</h3>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Suspended Worker Accounts</p>
            <h3 className="text-2xl font-black text-red-400 font-mono mt-0.5">{suspendedWorkers}</h3>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by Name, Email, or Unique Worker ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0F9D58]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-zinc-400 font-bold mr-1 shrink-0">Filter Status:</span>
          {(['All', 'active', 'suspended'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#0F9D58] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {st === 'All' ? 'All Staff' : st}
            </button>
          ))}
        </div>
      </div>

      {/* WORKERS TABLE / LIST */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-black tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Worker Unique ID</th>
                <th className="px-6 py-4">Worker Name & Contact</th>
                <th className="px-6 py-4">Secure Passkey</th>
                <th className="px-6 py-4">Granted Permissions</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <Users size={36} className="mx-auto mb-2 opacity-40 text-zinc-600" />
                    <p className="font-bold text-sm">No worker accounts found matching criteria.</p>
                    <p className="text-xs text-zinc-600 mt-1">Click "+ Create Worker Account" to assign worker credentials.</p>
                  </td>
                </tr>
              ) : (
                filteredWorkers.map(w => {
                  const isPasskeyVisible = visiblePasskeys[w.id];
                  return (
                    <tr key={w.id} className="hover:bg-zinc-800/40 transition-colors">
                      
                      {/* WORKER ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                            {w.id}
                          </span>
                          <button
                            onClick={() => copyToClipboard(w.id, 'Worker ID')}
                            title="Copy Worker ID"
                            className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 block">Created: {new Date(w.createdAt).toLocaleDateString()}</span>
                      </td>

                      {/* NAME & EMAIL */}
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-white text-sm">{w.workerName}</div>
                        <div className="text-zinc-400 text-xs font-mono">{w.workerEmail}</div>
                      </td>

                      {/* PASSKEY */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 text-zinc-300">
                            {isPasskeyVisible ? w.workerPasskey : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasskeyVisibility(w.id)}
                            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title={isPasskeyVisible ? "Hide Passkey" : "Show Passkey"}
                          >
                            {isPasskeyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(w.workerPasskey, 'Worker Passkey')}
                            className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            title="Copy Passkey"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      {/* ALLOWED PERMISSIONS */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {w.allowedModules?.includes('products') && (
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              📦 Products CMS
                            </span>
                          )}
                          {w.allowedModules?.includes('blogs') && (
                            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              📝 Blog CMS
                            </span>
                          )}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        {w.status === 'active' ? (
                          <span className="inline-flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <CheckCircle size={12} />
                            <span>Active / فعال</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <Ban size={12} />
                            <span>Suspended / بلاک</span>
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-right space-x-2">
                        {/* Change Passkey */}
                        <button
                          onClick={() => {
                            setResetPasskeyModalOpen(w);
                            setNewPasskeyInput(w.workerPasskey);
                          }}
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1 font-bold text-[11px]"
                          title="Reset Worker Passkey"
                        >
                          <Key size={13} />
                          <span className="hidden lg:inline">Passkey</span>
                        </button>

                        {/* Suspend / Activate Toggle */}
                        <button
                          onClick={() => updateWorkerAccountStatus(w.id, w.status === 'active' ? 'suspended' : 'active')}
                          className={`p-2 rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1 font-bold text-[11px] ${
                            w.status === 'active'
                              ? 'bg-amber-950/30 hover:bg-amber-950/60 border border-amber-900/40 text-amber-400'
                              : 'bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-900/40 text-emerald-400'
                          }`}
                          title={w.status === 'active' ? 'Suspend Worker' : 'Activate Worker'}
                        >
                          {w.status === 'active' ? <Ban size={13} /> : <CheckCircle size={13} />}
                          <span className="hidden lg:inline">{w.status === 'active' ? 'Suspend' : 'Activate'}</span>
                        </button>

                        {/* Delete Worker */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to permanently delete worker account ${w.workerName} (${w.id})?`)) {
                              deleteWorkerAccount(w.id);
                            }
                          }}
                          className="p-2 bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 text-red-400 rounded-xl transition-all cursor-pointer"
                          title="Delete Worker Account"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE WORKER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative text-left">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute right-5 top-5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0F9D58] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                Security & Staff Admin
              </span>
              <h2 className="text-xl font-black text-white mt-2">Create New Worker Account</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Assign a unique Worker ID and password. The worker will use this ID to upload products & blogs.
              </p>
            </div>

            <form onSubmit={handleCreateWorkerSubmit} className="space-y-4">
              {/* WORKER ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-zinc-400">Unique Worker ID (خصوصی آئی ڈی)</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={wId}
                    onChange={(e) => setWId(e.target.value.toUpperCase())}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-[#0F9D58]"
                  />
                  <button
                    type="button"
                    onClick={() => setWId(`WRK-${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-bold rounded-2xl border border-zinc-700"
                    title="Generate Random ID"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* WORKER FULL NAME */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-zinc-400">Worker Full Name (ورکر کا نام)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Ahmed"
                  value={wName}
                  onChange={(e) => setWName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0F9D58]"
                />
              </div>

              {/* WORKER EMAIL / USERNAME */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-zinc-400">Worker Login Email or Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ali_worker or ali.work@paktajarat.pk"
                  value={wEmail}
                  onChange={(e) => setWEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#0F9D58]"
                />
              </div>

              {/* WORKER PASSKEY */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-zinc-400">Secure Worker Passkey / Password</label>
                <input
                  type="text"
                  required
                  value={wPasskey}
                  onChange={(e) => setWPasskey(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#0F9D58]"
                />
              </div>

              {/* ALLOWED PERMISSIONS */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-[10px] font-extrabold uppercase text-zinc-400 block">Allowed Permissions (دستیاب رسائی)</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2.5 p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wProductsAllowed}
                      onChange={(e) => setWProductsAllowed(e.target.checked)}
                      className="w-4 h-4 text-[#0F9D58] rounded border-zinc-700 focus:ring-0"
                    />
                    <span className="text-xs text-zinc-200 font-bold">📦 Product Catalog Upload & Management (پروڈکٹس)</span>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wBlogsAllowed}
                      onChange={(e) => setWBlogsAllowed(e.target.checked)}
                      className="w-4 h-4 text-[#0F9D58] rounded border-zinc-700 focus:ring-0"
                    />
                    <span className="text-xs text-zinc-200 font-bold">📝 Educational Blog Posts Manager (بلاگ)</span>
                  </label>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1"
                >
                  <ShieldCheck size={16} />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSKEY MODAL */}
      {resetPasskeyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-left">
            <button
              onClick={() => setResetPasskeyModalOpen(null)}
              className="absolute right-5 top-5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-lg font-black text-white">Update Worker Passkey</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Worker: <span className="text-emerald-400 font-bold">{resetPasskeyModalOpen.workerName}</span> ({resetPasskeyModalOpen.id})
              </p>
            </div>

            <form onSubmit={handleSaveNewPasskey} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-zinc-400">New Passkey / Password</label>
                <input
                  type="text"
                  required
                  value={newPasskeyInput}
                  onChange={(e) => setNewPasskeyInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#0F9D58]"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPasskeyModalOpen(null)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0F9D58] hover:bg-[#0B7B44] text-white font-bold text-xs rounded-xl"
                >
                  Save Passkey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
