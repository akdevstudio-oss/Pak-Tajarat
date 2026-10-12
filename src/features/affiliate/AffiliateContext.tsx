import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Affiliate, AffiliateApplication, ReferralTransaction, WithdrawalRequest 
} from '../../shared/types';
import { db, auth } from '../../firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, getDocs, query, where, increment, getDoc } from 'firebase/firestore';
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

export const AffiliateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useUI();
  const { currentUser } = useAuth();

  const [currentAffiliate, setCurrentAffiliate] = useState<Affiliate | null>(null);
  const [currentAffiliateApplication, setCurrentAffiliateApplication] = useState<AffiliateApplication | null>(null);
  const [affiliateReferrals, setAffiliateReferrals] = useState<ReferralTransaction[]>([]);
  const [affiliateWithdrawals, setAffiliateWithdrawals] = useState<WithdrawalRequest[]>([]);

  const [allAffiliates, setAllAffiliates] = useState<Affiliate[]>([]);
  const [allAffiliateApplications, setAllAffiliateApplications] = useState<AffiliateApplication[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [allReferrals, setAllReferrals] = useState<ReferralTransaction[]>([]);

  const [commissionRate, setCommissionRateState] = useState<number>(10);

  // Sync Affiliate data for current user
  useEffect(() => {
    if (!currentUser) {
      setCurrentAffiliate(null);
      setCurrentAffiliateApplication(null);
      setAffiliateReferrals([]);
      setAffiliateWithdrawals([]);
      setAllAffiliates([]);
      setAllAffiliateApplications([]);
      setAllWithdrawals([]);
      setAllReferrals([]);
      return;
    }

    const isAdmin = currentUser.role === 'Admin';
    const isLocalUser = (currentUser.id.startsWith('local-') || !auth.currentUser) && !isAdmin;

    if (isLocalUser) {
      const localAffStr = localStorage.getItem(`pak_tajarat_local_affiliate_${currentUser.id}`);
      if (localAffStr) {
        try { setCurrentAffiliate(JSON.parse(localAffStr)); } catch (_) {}
      } else {
        setCurrentAffiliate(null);
      }

      const localAffAppStr = localStorage.getItem(`pak_tajarat_local_aff_app_${currentUser.id}`);
      if (localAffAppStr) {
        try {
          const appObj = JSON.parse(localAffAppStr) as AffiliateApplication;
          setCurrentAffiliateApplication(appObj);
        } catch (_) {
          setCurrentAffiliateApplication(null);
        }
      } else {
        setCurrentAffiliateApplication(null);
      }
      return;
    }

    // Cloud Listeners
    const unsubscribeAffiliate = onSnapshot(doc(db, 'affiliates', currentUser.id), (docSnap) => {
      if (docSnap.exists()) {
        setCurrentAffiliate({ id: docSnap.id, ...docSnap.data() } as Affiliate);
      } else {
        setCurrentAffiliate(null);
      }
    }, (err) => {
      console.warn("Affiliate doc snapshot warning:", err);
    });

    const unsubscribeAffiliateApp = onSnapshot(doc(db, 'affiliateApplications', currentUser.id), (docSnap) => {
      if (docSnap.exists()) {
        setCurrentAffiliateApplication({ id: docSnap.id, ...docSnap.data() } as AffiliateApplication);
      } else {
        setCurrentAffiliateApplication(null);
      }
    }, (err) => {
      console.warn("Affiliate app doc snapshot warning:", err);
    });

    const refQuery = query(collection(db, 'referrals'), where('affiliateId', '==', currentUser.id));
    const unsubscribeReferrals = onSnapshot(refQuery, (snapshot) => {
      const list: ReferralTransaction[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ReferralTransaction);
      });
      setAffiliateReferrals(list);
    }, (err) => {
      console.warn("Referrals query snapshot warning:", err);
    });

    const withQuery = query(collection(db, 'withdrawals'), where('affiliateId', '==', currentUser.id));
    const unsubscribeWithdrawals = onSnapshot(withQuery, (snapshot) => {
      const list: WithdrawalRequest[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as WithdrawalRequest);
      });
      setAffiliateWithdrawals(list);
    }, (err) => {
      console.warn("Withdrawals query snapshot warning:", err);
    });

    let unsubscribeAllAffs = () => {};
    let unsubscribeAllApps = () => {};
    let unsubscribeAllWiths = () => {};
    let unsubscribeAllRefs = () => {};

    if (currentUser.role === 'Admin') {
      unsubscribeAllAffs = onSnapshot(collection(db, 'affiliates'), (snap) => {
        const list: Affiliate[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as Affiliate));
        setAllAffiliates(list);
      }, (err) => {
        console.warn("Admin all affiliates snapshot warning:", err);
      });

      unsubscribeAllApps = onSnapshot(collection(db, 'affiliateApplications'), (snap) => {
        const list: AffiliateApplication[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as AffiliateApplication));
        setAllAffiliateApplications(list);
      }, (err) => {
        console.warn("Admin all affiliate apps snapshot warning:", err);
      });

      unsubscribeAllWiths = onSnapshot(collection(db, 'withdrawals'), (snap) => {
        const list: WithdrawalRequest[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as WithdrawalRequest));
        setAllWithdrawals(list);
      }, (err) => {
        console.warn("Admin all withdrawals snapshot warning:", err);
      });

      unsubscribeAllRefs = onSnapshot(collection(db, 'referrals'), (snap) => {
        const list: ReferralTransaction[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as ReferralTransaction));
        setAllReferrals(list);
      }, (err) => {
        console.warn("Admin all referrals snapshot warning:", err);
      });
    }

    return () => {
      unsubscribeAffiliate();
      unsubscribeAffiliateApp();
      unsubscribeReferrals();
      unsubscribeWithdrawals();
      unsubscribeAllAffs();
      unsubscribeAllApps();
      unsubscribeAllWiths();
      unsubscribeAllRefs();
    };
  }, [currentUser?.id, currentUser?.role]);

  const setCommissionRate = async (rate: number) => {
    setCommissionRateState(rate);
    const isLocalUser = !currentUser || currentUser.id.startsWith('local-') || !auth.currentUser;
    if (!isLocalUser) {
      try {
        await setDoc(doc(db, 'config', 'global'), { commissionPercentage: rate }, { merge: true });
      } catch (e) {}
    }
    addNotification('Commission Rate Saved', `Global commission rate updated to ${rate}%.`, 'success');
  };

  const trackReferralClick = async (refCode: string): Promise<string | null> => {
    if (!refCode) return null;
    try {
      // First check if refCode matches direct affiliate id or referralCode in Firestore
      const affDocRef = doc(db, 'affiliates', refCode);
      const affSnap = await getDoc(affDocRef);
      if (affSnap.exists()) {
        await updateDoc(affDocRef, { totalClicks: increment(1) });
        return affSnap.id;
      }

      // Look up by referralCode
      const q = query(collection(db, 'affiliates'), where('referralCode', '==', refCode));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const foundDoc = querySnap.docs[0];
        await updateDoc(doc(db, 'affiliates', foundDoc.id), { totalClicks: increment(1) });
        return foundDoc.id;
      }
    } catch (err) {
      console.warn("Error tracking referral click:", err);
    }
    return refCode;
  };

  const registerAsAffiliate = async (payoutMethod: string, payoutDetails: string): Promise<boolean> => {
    if (!currentUser) return false;
    const affiliateId = currentUser.id;
    const referralCode = `PAK-${currentUser.fullName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAffiliate: Affiliate = {
      id: affiliateId,
      userId: affiliateId,
      referralCode,
      totalClicks: 0,
      totalReferrals: 0,
      totalEarnings: 0,
      pendingCommission: 0,
      paidCommission: 0,
      status: 'pending_approval',
      paymentMethod: payoutMethod,
      paymentDetails: payoutDetails,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    const isLocalUser = currentUser.id.startsWith('local-') || !auth.currentUser;

    if (isLocalUser) {
      const localAffiliate: Affiliate = { ...newAffiliate, status: 'active' };
      setCurrentAffiliate(localAffiliate);
      localStorage.setItem(`pak_tajarat_local_affiliate_${currentUser.id}`, JSON.stringify(localAffiliate));
      addNotification('Affiliate Registered (Local Mode)', `You are now an active Affiliate. Code: ${referralCode}`, 'success');
      return true;
    }

    try {
      await setDoc(doc(db, 'affiliates', affiliateId), newAffiliate);
      addNotification('Affiliate Application Submitted', 'Registration is pending admin review.', 'success');
      return true;
    } catch (err) {
      console.error("Error registering affiliate:", err);
      return false;
    }
  };

  const submitWithdrawalRequest = async (amount: number, method: string, details: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || !currentAffiliate) return { success: false, message: 'Authentication required' };

    if (amount > currentAffiliate.pendingCommission) {
      return { success: false, message: 'Withdrawal amount exceeds your pending commission balance.' };
    }
    if (amount < 1000) {
      return { success: false, message: 'Minimum payout withdrawal is Rs. 1,000.' };
    }

    const withId = `with-${Date.now()}`;
    const freshWith: WithdrawalRequest = {
      id: withId,
      affiliateId: currentUser.id,
      amount,
      paymentMethod: method,
      paymentDetails: details,
      status: 'pending',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    const isLocalUser = currentUser.id.startsWith('local-') || !auth.currentUser;

    if (isLocalUser) {
      setAffiliateWithdrawals(prev => [freshWith, ...prev]);
      const updatedAff = {
        ...currentAffiliate,
        pendingCommission: Math.max(0, currentAffiliate.pendingCommission - amount)
      };
      setCurrentAffiliate(updatedAff);
      localStorage.setItem(`pak_tajarat_local_affiliate_${currentUser.id}`, JSON.stringify(updatedAff));
      addNotification('Payout Requested (Local)', `Withdrawal request for Rs. ${amount.toLocaleString()} submitted.`, 'success');
      return { success: true, message: 'Withdrawal request submitted successfully.' };
    }

    try {
      await setDoc(doc(db, 'withdrawals', withId), freshWith);
      await updateDoc(doc(db, 'affiliates', currentUser.id), {
        pendingCommission: increment(-amount)
      });
      addNotification('Payout Requested', `Withdrawal request for Rs. ${amount.toLocaleString()} submitted.`, 'success');
      return { success: true, message: 'Withdrawal request submitted successfully.' };
    } catch (err) {
      console.error("Error submitting withdrawal:", err);
      return { success: false, message: 'Failed to submit withdrawal request.' };
    }
  };

  const submitAffiliateApplication = async (
    application: Omit<AffiliateApplication, 'uid' | 'status' | 'affiliateActivated' | 'emailVerified' | 'adminNotes' | 'submittedAt'>
  ): Promise<boolean> => {
    if (!currentUser) return false;
    const appId = currentUser.id;

    const newApp: AffiliateApplication = {
      ...application,
      uid: currentUser.id,
      status: 'Pending',
      affiliateActivated: false,
      emailVerified: false,
      adminNotes: '',
      submittedAt: new Date().toISOString()
    };

    const isLocalUser = currentUser.id.startsWith('local-') || !auth.currentUser;

    if (isLocalUser) {
      setCurrentAffiliateApplication(newApp);
      localStorage.setItem(`pak_tajarat_local_aff_app_${currentUser.id}`, JSON.stringify(newApp));
      addNotification('Application Submitted Successfully', 'Thank you for applying to the Pak-Tajarat Affiliate Program.', 'success');
      return true;
    }

    try {
      await setDoc(doc(db, 'affiliateApplications', appId), newApp);
      addNotification('Application Submitted Successfully', 'Thank you for applying to the Pak-Tajarat Affiliate Program.', 'success');
      return true;
    } catch (err) {
      console.error("Error submitting affiliate application:", err);
      return false;
    }
  };

  const updateAffiliateApplicationStatus = async (
    appId: string,
    status: AffiliateApplication['status'],
    adminNotes: string = ''
  ): Promise<void> => {
    const isLocalUser = appId.startsWith('local-') || !auth.currentUser;

    const referralCode = `PAK-AFF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAff: Affiliate = {
      id: appId,
      userId: appId,
      referralCode,
      totalClicks: 0,
      totalReferrals: 0,
      totalEarnings: 0,
      pendingCommission: 0,
      paidCommission: 0,
      status: status === 'Approved' ? 'active' : status === 'Rejected' ? 'rejected' : 'pending_approval',
      paymentMethod: 'EasyPaisa',
      paymentDetails: '',
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      rejectionReason: status === 'Rejected' ? adminNotes : '',
      activated: status === 'Approved'
    };

    if (isLocalUser) {
      setAllAffiliateApplications(prev => prev.map(a => (a.uid === appId || a.id === appId) ? { ...a, status, adminNotes } : a));
      if (currentUser?.id === appId) {
        setCurrentAffiliate(newAff);
      }
      addNotification('Application Processed (Local)', `Application status set to ${status}.`, 'info');
      return;
    }

    try {
      await updateDoc(doc(db, 'affiliateApplications', appId), {
        status,
        adminNotes,
        affiliateActivated: status === 'Approved'
      });
      await setDoc(doc(db, 'affiliates', appId), newAff);
      addNotification('Application Processed', `Application marked as ${status}.`, 'success');
    } catch (err) {
      console.error("Error updating affiliate application status:", err);
    }
  };

  const updateAffiliateStatus = async (affiliateId: string, status: Affiliate['status']) => {
    const isLocalUser = affiliateId.startsWith('local-') || !auth.currentUser;
    if (isLocalUser) {
      setAllAffiliates(prev => prev.map(a => a.id === affiliateId ? { ...a, status } : a));
      addNotification('Affiliate Status Updated (Local)', `Set status to ${status}`, 'info');
      return;
    }
    try {
      await updateDoc(doc(db, 'affiliates', affiliateId), { status });
      addNotification('Affiliate Status Updated', `Set status to ${status}`, 'success');
    } catch (err) {
      console.error("Error updating affiliate status:", err);
    }
  };

  const updateWithdrawalStatus = async (withdrawalId: string, status: WithdrawalRequest['status']) => {
    const isLocalUser = withdrawalId.startsWith('local-') || !auth.currentUser;
    const targetWith = allWithdrawals.find(w => w.id === withdrawalId);

    if (isLocalUser) {
      setAllWithdrawals(prev => prev.map(w => w.id === withdrawalId ? { ...w, status } : w));
      if (targetWith) {
        if (status === 'approved') {
          setAllAffiliates(prev => prev.map(a => a.id === targetWith.affiliateId ? { ...a, paidCommission: a.paidCommission + targetWith.amount } : a));
        } else if (status === 'rejected') {
          setAllAffiliates(prev => prev.map(a => a.id === targetWith.affiliateId ? { ...a, pendingCommission: a.pendingCommission + targetWith.amount } : a));
        }
      }
      addNotification('Withdrawal Updated (Local)', `Set status to ${status}`, 'info');
      return;
    }
    try {
      await updateDoc(doc(db, 'withdrawals', withdrawalId), { status });
      if (targetWith) {
        if (status === 'approved') {
          await updateDoc(doc(db, 'affiliates', targetWith.affiliateId), {
            paidCommission: increment(targetWith.amount)
          });
        } else if (status === 'rejected') {
          await updateDoc(doc(db, 'affiliates', targetWith.affiliateId), {
            pendingCommission: increment(targetWith.amount)
          });
        }
      }
      addNotification('Withdrawal Updated', `Set status to ${status}`, 'success');
    } catch (err) {
      console.error("Error updating withdrawal status:", err);
    }
  };

  const checkTopSellerOfMonth = async () => {
    try {
      const snap = await getDocs(collection(db, 'affiliates'));
      let bestAff: Affiliate | null = null;
      let maxSales = -1;

      const affiliatesList: Affiliate[] = [];
      snap.forEach(d => {
        const aff = { id: d.id, ...d.data() } as Affiliate;
        affiliatesList.push(aff);
        if (aff.status === 'active' && aff.totalReferrals > maxSales) {
          maxSales = aff.totalReferrals;
          bestAff = aff;
        }
      });

      if (bestAff && maxSales > 0) {
        for (const aff of affiliatesList) {
          const isCurrentBest = aff.id === (bestAff as Affiliate).id;
          if (aff.isTopSeller !== isCurrentBest) {
            await updateDoc(doc(db, 'affiliates', aff.id), { isTopSeller: isCurrentBest });
          }
        }
      }
    } catch (err) {
      console.error("Error checking top seller:", err);
    }
  };

  const processCoolingCommissions = async () => {
    if (!currentUser || !currentAffiliate) return;
    const isLocalUser = currentUser.id.startsWith('local-') || !auth.currentUser;
    if (isLocalUser) return;

    try {
      const refQuery = query(
        collection(db, 'referrals'),
        where('affiliateId', '==', currentUser.id),
        where('status', '==', 'cooling')
      );
      const snap = await getDocs(refQuery);

      let newlyAvailable = 0;

      for (const rDoc of snap.docs) {
        const refTx = rDoc.data() as any;
        const deliveryDateStr = refTx.deliveryDate;
        if (deliveryDateStr) {
          const deliveryTime = new Date(deliveryDateStr).getTime();
          const currentTime = Date.now();
          const diffDays = (currentTime - deliveryTime) / (1000 * 60 * 60 * 24);

          if (diffDays >= 5) {
            const commAmt = refTx.commissionAmount || 0;
            await updateDoc(doc(db, 'referrals', rDoc.id), { status: 'approved' });
            await updateDoc(doc(db, 'affiliates', currentUser.id), {
              pendingCommission: increment(commAmt),
              totalEarnings: increment(commAmt)
            });
            newlyAvailable += commAmt;
          }
        }
      }

      if (newlyAvailable > 0) {
        await checkTopSellerOfMonth();
        addNotification(
          'Commission Cleared!',
          `Rs. ${newlyAvailable.toLocaleString()} passed cooling period and is available!`,
          'success'
        );
      }
    } catch (err) {
      console.error("Error processing cooling commissions:", err);
    }
  };

  const fastForwardCoolingCommissions = async () => {
    if (!currentUser || !currentAffiliate) return;
    const isLocalUser = currentUser.id.startsWith('local-') || !auth.currentUser;
    if (isLocalUser) {
      addNotification('Fast-Forward (Local)', 'Cooling period bypassed in local mode.', 'info');
      return;
    }

    try {
      const refQuery = query(
        collection(db, 'referrals'),
        where('affiliateId', '==', currentUser.id),
        where('status', '==', 'cooling')
      );
      const snap = await getDocs(refQuery);
      let newlyAvailable = 0;

      for (const rDoc of snap.docs) {
        const refTx = rDoc.data() as any;
        const commAmt = refTx.commissionAmount || 0;

        await updateDoc(doc(db, 'referrals', rDoc.id), { status: 'approved' });
        await updateDoc(doc(db, 'affiliates', currentUser.id), {
          pendingCommission: increment(commAmt),
          totalEarnings: increment(commAmt)
        });

        newlyAvailable += commAmt;
      }

      if (newlyAvailable > 0) {
        await checkTopSellerOfMonth();
        addNotification('Fast-Forward Completed', `Rs. ${newlyAvailable.toLocaleString()} approved!`, 'success');
      } else {
        addNotification('No Cooling Commissions', 'No pending cooling commissions found.', 'info');
      }
    } catch (err) {
      console.error("Error fast forwarding cooling commissions:", err);
    }
  };

  const verifyEmailDemo = async () => {
    addNotification('Demo: Email Verified', 'Your email is verified in demo mode.', 'success');
  };

  const activateAffiliateDemo = async (activated: boolean) => {
    if (!currentAffiliate) return;
    setCurrentAffiliate({ ...currentAffiliate, activated });
    addNotification('Affiliate Activation Updated', `Status: ${activated ? 'Active' : 'Inactive'}`, 'info');
  };

  const approveAffiliateDemo = async () => {
    if (!currentAffiliate) return;
    setCurrentAffiliate({ ...currentAffiliate, status: 'active' });
    addNotification('Application Approved', 'Affiliate status set to Active.', 'success');
  };

  return (
    <AffiliateContext.Provider value={{
      currentAffiliate, currentAffiliateApplication, affiliateReferrals, affiliateWithdrawals,
      allAffiliates, allAffiliateApplications, allWithdrawals, allReferrals,
      commissionRate, setCommissionRate, trackReferralClick,
      registerAsAffiliate, submitWithdrawalRequest, submitAffiliateApplication, updateAffiliateApplicationStatus,
      updateAffiliateStatus, updateWithdrawalStatus,
      checkTopSellerOfMonth, processCoolingCommissions, fastForwardCoolingCommissions,
      verifyEmailDemo, activateAffiliateDemo, approveAffiliateDemo
    }}>
      {children}
    </AffiliateContext.Provider>
  );
};

export const useAffiliate = () => {
  const context = useContext(AffiliateContext);
  if (!context) {
    throw new Error('useAffiliate must be used within an AffiliateProvider');
  }
  return context;
};
