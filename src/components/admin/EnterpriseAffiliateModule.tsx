import React, { useState } from 'react';
import { useAffiliate } from '../../features/affiliate/AffiliateContext';
import { useApp } from '../../context/AppContext';
import { Affiliate, AffiliateApplication } from '../../shared/types';
import { Users, FileText, Link2, DollarSign, RefreshCw, Check, X, Settings, Award } from 'lucide-react';

export type SubTab = 'dashboard' | 'applications' | 'affiliates' | 'referral-links' | 'commissions' | 'orders' | 'payout-requests' | 'payment-history' | 'coupons' | 'marketing-assets' | 'fraud-detection' | 'reports' | 'notifications' | 'settings' | 'terms' | 'activity-logs';

export const EnterpriseAffiliateModule: React.FC = () => {
  const { addNotification } = useApp();
  const {
    allAffiliates, allAffiliateApplications, allWithdrawals, allReferrals,
    commissionRate, setCommissionRate, updateAffiliateApplicationStatus,
    updateAffiliateStatus, updateWithdrawalStatus, checkTopSellerOfMonth
  } = useAffiliate();
  const [tab, setTab] = useState<'overview' | 'applications' | 'affiliates' | 'referrals' | 'payouts' | 'settings'>('overview');
  const [rateInput, setRateInput] = useState(String(commissionRate));
  const [busy, setBusy] = useState(false);

  const act = async (label: string, action: () => Promise<unknown>) => {
    setBusy(true);
    try { await action(); addNotification('Affiliate Updated', label, 'success'); }
    catch (error) { addNotification('Action Failed', error instanceof Error ? error.message : 'Please retry.', 'warning'); }
    finally { setBusy(false); }
  };

  const tabs = [
    ['overview', 'Overview', Settings], ['applications', 'Applications', FileText],
    ['affiliates', 'Affiliates', Users], ['referrals', 'Referrals', Link2],
    ['payouts', 'Payouts', DollarSign], ['settings', 'Commission', Award]
  ] as const;
  const pendingApps = allAffiliateApplications.filter(a => a.status === 'Pending').length;
  const pendingPayouts = allWithdrawals.filter(w => w.status === 'pending').length;
  const totalPending = allAffiliates.reduce((sum, a) => sum + Number(a.pendingCommission || 0), 0);

  return <div className="mx-auto max-w-7xl space-y-6 pb-12">
    <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Pak-Tijarat Partner Program</p><h1 className="mt-2 text-2xl font-black">Affiliate Management</h1><p className="mt-1 text-sm text-zinc-400">MongoDB-backed applications, referrals, commissions and payouts.</p></div>
        <button disabled={busy} onClick={() => window.location.reload()} className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-bold disabled:opacity-50"><RefreshCw size={15}/> Refresh</button>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        ['Active affiliates', allAffiliates.filter(a => a.status === 'active').length],
        ['Pending applications', pendingApps],
        ['Pending payouts', pendingPayouts],
        ['Commission pending', 'Rs. ' + totalPending.toLocaleString()]
      ].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"><p className="text-xs font-semibold text-zinc-400">{label}</p><p className="mt-2 text-xl font-black text-emerald-400">{value}</p></div>)}
    </div>
    <div className="flex flex-wrap gap-2">{tabs.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${tab === id ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-300'}`}><Icon size={15}/>{label}</button>)}</div>

    {tab === 'overview' && <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><h2 className="text-lg font-black text-white">Program overview</h2><p className="mt-2 text-sm text-zinc-400">Affiliate applications, approved partners, order referrals and payout requests are managed through the MongoDB API. Commissions enter the cooling period after delivery and become withdrawable after the return window.</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => setTab('applications')} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Review applications</button><button onClick={() => setTab('payouts')} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold text-white">Review payouts</button><button disabled={busy} onClick={() => void act('Top seller recalculated.', checkTopSellerOfMonth)} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Select top seller</button></div></div>}

    {tab === 'applications' && <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"><div className="border-b border-zinc-800 p-4 font-bold text-white">Affiliate applications ({allAffiliateApplications.length})</div>{allAffiliateApplications.length === 0 ? <p className="p-5 text-sm text-zinc-400">No applications have been submitted yet.</p> : allAffiliateApplications.map((app: AffiliateApplication) => <div key={app.uid || app.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 p-4 last:border-0"><div><p className="font-bold text-white">{app.fullName || app.email}</p><p className="text-xs text-zinc-400">{app.email} · {app.mobileNumber} · {app.status}</p></div>{app.status === 'Pending' && <div className="flex gap-2"><button disabled={busy} onClick={() => void act('Application approved.', () => updateAffiliateApplicationStatus(app.uid || app.id || '', 'Approved'))} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><Check size={14} className="inline"/> Approve</button><button disabled={busy} onClick={() => void act('Application rejected.', () => updateAffiliateApplicationStatus(app.uid || app.id || '', 'Rejected'))} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white"><X size={14} className="inline"/> Reject</button></div>}</div>)}</div>}

    {tab === 'affiliates' && <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"><div className="border-b border-zinc-800 p-4 font-bold text-white">Affiliate partners ({allAffiliates.length})</div>{allAffiliates.length === 0 ? <p className="p-5 text-sm text-zinc-400">No registered affiliates yet.</p> : allAffiliates.map((a: Affiliate) => <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 p-4 last:border-0"><div><p className="font-bold text-white">{a.id}</p><p className="text-xs text-zinc-400">Code: {a.referralCode} · Clicks: {a.totalClicks} · Referrals: {a.totalReferrals} · Earnings: Rs. {Number(a.totalEarnings || 0).toLocaleString()}</p></div><div className="flex items-center gap-2"><span className="text-xs text-zinc-400">{a.status}</span>{a.status === 'active' ? <button disabled={busy} onClick={() => void act('Affiliate deactivated.', () => updateAffiliateStatus(a.id, 'inactive'))} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-white">Deactivate</button> : <button disabled={busy} onClick={() => void act('Affiliate activated.', () => updateAffiliateStatus(a.id, 'active'))} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Activate</button>}</div></div>)}</div>}

    {tab === 'referrals' && <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"><div className="border-b border-zinc-800 p-4 font-bold text-white">Referral activity ({allReferrals.length})</div>{allReferrals.length === 0 ? <p className="p-5 text-sm text-zinc-400">No referral activity recorded yet.</p> : allReferrals.map(r => <div key={r.id} className="flex flex-wrap justify-between gap-2 border-b border-zinc-800 p-4 text-sm last:border-0"><span className="text-white">{r.orderId || r.id} · {r.type}</span><span className="text-zinc-400">{r.status} · Rs. {Number(r.commissionAmount || 0).toLocaleString()}</span></div>)}</div>}

    {tab === 'payouts' && <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"><div className="border-b border-zinc-800 p-4 font-bold text-white">Payout requests ({allWithdrawals.length})</div>{allWithdrawals.length === 0 ? <p className="p-5 text-sm text-zinc-400">No payout requests yet.</p> : allWithdrawals.map(w => <div key={w.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 p-4 last:border-0"><div><p className="font-bold text-white">Rs. {Number(w.amount).toLocaleString()} · {w.paymentMethod}</p><p className="text-xs text-zinc-400">{w.affiliateId} · {w.paymentDetails} · {w.status}</p></div>{w.status === 'pending' && <div className="flex gap-2"><button disabled={busy} onClick={() => void act('Payout approved.', () => updateWithdrawalStatus(w.id, 'approved'))} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Approve</button><button disabled={busy} onClick={() => void act('Payout rejected.', () => updateWithdrawalStatus(w.id, 'rejected'))} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">Reject</button></div>}</div>)}</div>}

    {tab === 'settings' && <div className="max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><h2 className="text-lg font-black text-white">Global commission rate</h2><p className="mt-1 text-sm text-zinc-400">Percentage used when a product does not define its own affiliate commission rate.</p><label className="mt-4 block text-xs font-bold text-zinc-300">Commission percentage (0–100)</label><input type="number" min="0" max="100" value={rateInput} onChange={e => setRateInput(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"/><button disabled={busy} onClick={() => { const value=Number(rateInput); if(!Number.isFinite(value)||value<0||value>100){addNotification('Invalid rate','Enter a value from 0 to 100.','warning');return;} void act('Commission rate saved.', async()=>{await setCommissionRate(value);}); }} className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Save rate</button></div>}
  </div>;
};
