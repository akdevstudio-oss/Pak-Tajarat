import React, { createContext, useContext, useState, useEffect } from 'react';
import { Affiliate, AffiliateApplication, ReferralTransaction, WithdrawalRequest } from '../../shared/types';
import { useUI } from '../ui/UIContext';
import { useAuth } from '../auth/AuthContext';

export interface AffiliateContextType {
  currentAffiliate: Affiliate | null;
  currentAffiliateApplication: AffiliateApplication | null;
  affiliateReferrals: ReferralTransaction[];
  affiliateWithdrawals: WithdrawalRequest[];
  allAffiliates: Affiliate[];
  allAffiliateApplications: AffiliateApplication[];
  allWithdrawals: WithdrawalRequest[];
  allReferrals: ReferralTransaction[];
  commissionRate: number;
  setCommissionRate: (rate: number) => Promise<void>;
  trackReferralClick: (refCode: string) => Promise<string | null>;
  registerAsAffiliate: (payoutMethod: string, payoutDetails: string) => Promise<boolean>;
  submitWithdrawalRequest: (amount: number, method: string, details: string) => Promise<{ success: boolean; message: string }>;
  submitAffiliateApplication: (application: Omit<AffiliateApplication, 'uid' | 'status' | 'affiliateActivated' | 'emailVerified' | 'adminNotes' | 'submittedAt'>) => Promise<boolean>;
  updateAffiliateApplicationStatus: (appId: string, status: AffiliateApplication['status'], adminNotes?: string) => Promise<void>;
  updateAffiliateStatus: (affiliateId: string, status: Affiliate['status']) => Promise<void>;
  updateWithdrawalStatus: (withdrawalId: string, status: WithdrawalRequest['status']) => Promise<void>;
  checkTopSellerOfMonth: () => Promise<void>;
  processCoolingCommissions: () => Promise<void>;
  fastForwardCoolingCommissions: () => Promise<void>;
  verifyEmailDemo: () => Promise<void>;
  activateAffiliateDemo: (activated: boolean) => Promise<void>;
  approveAffiliateDemo: () => Promise<void>;
}
const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined);

async function request(action?: string, body: Record<string, unknown> = {}) {
  const response = await fetch('/api/affiliate', {
    method: action ? 'POST' : 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: action ? { 'Content-Type': 'application/json' } : undefined,
    body: action ? JSON.stringify({ action, ...body }) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || 'Affiliate service is unavailable.');
  return data;
}

export const AffiliateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useUI();
  const { currentUser } = useAuth();
  const [currentAffiliate,setCurrentAffiliate]=useState<Affiliate|null>(null);
  const [currentAffiliateApplication,setCurrentAffiliateApplication]=useState<AffiliateApplication|null>(null);
  const [affiliateReferrals,setAffiliateReferrals]=useState<ReferralTransaction[]>([]);
  const [affiliateWithdrawals,setAffiliateWithdrawals]=useState<WithdrawalRequest[]>([]);
  const [allAffiliates,setAllAffiliates]=useState<Affiliate[]>([]);
  const [allAffiliateApplications,setAllAffiliateApplications]=useState<AffiliateApplication[]>([]);
  const [allWithdrawals,setAllWithdrawals]=useState<WithdrawalRequest[]>([]);
  const [allReferrals,setAllReferrals]=useState<ReferralTransaction[]>([]);
  const [commissionRate,setCommissionRateState]=useState(10);

  const refresh = async () => {
    const data=await request();
    setCurrentAffiliate(data.affiliate||null);
    setCurrentAffiliateApplication(data.application||null);
    setAffiliateReferrals(Array.isArray(data.referrals)?data.referrals:[]);
    setAffiliateWithdrawals(Array.isArray(data.withdrawals)?data.withdrawals:[]);
    setAllAffiliates(Array.isArray(data.allAffiliates)?data.allAffiliates:[]);
    setAllAffiliateApplications(Array.isArray(data.allApplications)?data.allApplications:[]);
    setAllWithdrawals(Array.isArray(data.allWithdrawals)?data.allWithdrawals:[]);
    setAllReferrals(Array.isArray(data.allReferrals)?data.allReferrals:[]);
    setCommissionRateState(Number(data.commissionRate)||10);
  };
  useEffect(() => {
    let active=true;
    if(!currentUser){setCurrentAffiliate(null);setCurrentAffiliateApplication(null);setAffiliateReferrals([]);setAffiliateWithdrawals([]);setAllAffiliates([]);setAllAffiliateApplications([]);setAllWithdrawals([]);setAllReferrals([]);return;}
    request().then(data=>{if(!active)return;setCurrentAffiliate(data.affiliate||null);setCurrentAffiliateApplication(data.application||null);setAffiliateReferrals(data.referrals||[]);setAffiliateWithdrawals(data.withdrawals||[]);setAllAffiliates(data.allAffiliates||[]);setAllAffiliateApplications(data.allApplications||[]);setAllWithdrawals(data.allWithdrawals||[]);setAllReferrals(data.allReferrals||[]);setCommissionRateState(Number(data.commissionRate)||10);}).catch(error=>console.warn('MongoDB affiliate sync unavailable:',error));
    return ()=>{active=false;};
  },[currentUser?.id,currentUser?.role]);

  const setCommissionRate=async(rate:number)=>{await request('setCommissionRate',{rate});setCommissionRateState(rate);};
  const trackReferralClick=async(refCode:string):Promise<string|null>=>{try{const data=await request('click',{refCode});return data.affiliateId||null;}catch(error){console.warn(error);return null;}};
  const registerAsAffiliate=async(payoutMethod:string,payoutDetails:string):Promise<boolean>=>{
    try{const data=await request('register',{paymentMethod:payoutMethod,payoutDetails});setCurrentAffiliate(data.affiliate);await refresh();return true;}catch(error){addNotification('Affiliate Registration Failed',error instanceof Error?error.message:'Please try again.','warning');return false;}
  };
  const submitWithdrawalRequest=async(amount:number,method:string,details:string):Promise<{success:boolean;message:string}>=>{
    try{await request('withdraw',{amount,method,details});await refresh();addNotification('Withdrawal Requested','Your payout request has been submitted.','success');return {success:true,message:'Withdrawal request submitted.'};}
    catch(error){const message=error instanceof Error?error.message:'Please try again.';return {success:false,message};}
  };
  const submitAffiliateApplication=async(application:Omit<AffiliateApplication,'uid'|'status'|'affiliateActivated'|'emailVerified'|'adminNotes'|'submittedAt'>):Promise<boolean>=>{
    try{await request('apply',{application});await refresh();addNotification('Application Submitted','Your affiliate application has been saved.','success');return true;}
    catch(error){addNotification('Application Failed',error instanceof Error?error.message:'Please sign in and try again.','warning');return false;}
  };
  const updateAffiliateApplicationStatus=async(appId:string,status:AffiliateApplication['status'],adminNotes='')=>{
    await request('applicationStatus',{id:appId,status,adminNotes,affiliateActivated:status==='Approved'});await refresh();
  };
  const updateAffiliateStatus=async(affiliateId:string,status:Affiliate['status'])=>{await request('affiliateStatus',{id:affiliateId,status});await refresh();};
  const updateWithdrawalStatus=async(withdrawalId:string,status:WithdrawalRequest['status'])=>{await request('withdrawalStatus',{id:withdrawalId,status});await refresh();};
  const checkTopSellerOfMonth=async()=>{await request('checkTopSeller');await refresh();};
  const processCoolingCommissions=async()=>{const data=await request('processCooling');await refresh();if(data.cleared>0)addNotification('Commission Cleared',`Rs. ${Number(data.cleared).toLocaleString()} is now available.`,'success');};
  const fastForwardCoolingCommissions=async()=>{addNotification('Protected Action','Commissions clear automatically after the 7-day return period.','info');};
  const verifyEmailDemo=async()=>{addNotification('Email Verification','Email verification must be completed through the account email workflow.','info');};
  const activateAffiliateDemo=async(activated:boolean)=>{
    if(!currentAffiliate)return;
    await request('applicationStatus',{id:currentUser?.id,status:activated?'Approved':'Suspended',affiliateActivated:activated});
    await refresh();
  };
  const approveAffiliateDemo=async()=>{if(!currentAffiliate)return;await request('affiliateStatus',{id:currentAffiliate.id,status:'active'});await refresh();addNotification('Affiliate Status Updated','Affiliate status updated.','success');};

  return <AffiliateContext.Provider value={{currentAffiliate,currentAffiliateApplication,affiliateReferrals,affiliateWithdrawals,allAffiliates,allAffiliateApplications,allWithdrawals,allReferrals,commissionRate,setCommissionRate,trackReferralClick,registerAsAffiliate,submitWithdrawalRequest,submitAffiliateApplication,updateAffiliateApplicationStatus,updateAffiliateStatus,updateWithdrawalStatus,checkTopSellerOfMonth,processCoolingCommissions,fastForwardCoolingCommissions,verifyEmailDemo,activateAffiliateDemo,approveAffiliateDemo}}>{children}</AffiliateContext.Provider>;
};
export const useAffiliate=()=>{const context=useContext(AffiliateContext);if(!context)throw new Error('useAffiliate must be used within an AffiliateProvider');return context;};
