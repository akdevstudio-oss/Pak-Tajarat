import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, ReferralTransaction } from '../../shared/types';
import { db, auth } from '../../firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { useUI } from '../ui/UIContext';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../cart/CartContext';
import { useProducts } from '../products/ProductsContext';
import { useAffiliate } from '../affiliate/AffiliateContext';

export interface OrdersContextType {
  orders: Order[];
  placeOrder: (paymentMethod: string, shippingAddress: any, billingAddress?: any) => Promise<{ success: boolean; order?: Order }>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useUI();
  const { currentUser } = useAuth();
  const { cart, cartTotals, clearCart } = useCart();
  const { updateStock } = useProducts();
  const { commissionRate } = useAffiliate();

  const [orders, setOrders] = useState<Order[]>([]);

    // Realtime Sync Orders for current user / admin
  useEffect(() => {
    if (!currentUser) {
      // Guest: Load any local guest orders
      try {
        const guestOrdersStr = localStorage.getItem('pak_tajarat_local_orders_guest');
        if (guestOrdersStr) {
          setOrders(JSON.parse(guestOrdersStr));
        } else {
          setOrders([]);
        }
      } catch (_) {
        setOrders([]);
      }
      return;
    }

    const isAdminOrWorker = currentUser.role === 'Admin' || currentUser.role === 'Worker';

    // If Admin/Worker, subscribe to ALL orders in Firestore in real-time
    if (isAdminOrWorker) {
      const ordersCol = collection(db, 'orders');
      const unsubscribeOrders = onSnapshot(ordersCol, (snapshot) => {
        const oList: Order[] = [];
        snapshot.forEach((docSnap) => {
          oList.push({ id: docSnap.id, ...docSnap.data() } as Order);
        });
        oList.sort((a, b) => b.id.localeCompare(a.id));
        setOrders(oList);
      }, (error) => {
        console.warn("Realtime orders sync warning (Admin):", error);
        // Fallback to local cache if offline
        try {
          const cached = localStorage.getItem('pak_tajarat_all_orders_cache');
          if (cached) setOrders(JSON.parse(cached));
        } catch (_) {}
      });

      return () => unsubscribeOrders();
    }

    // Regular logged-in Customer: query their orders from Firestore + local cache
    const userOrdersQuery = query(collection(db, 'orders'), where('userId', '==', currentUser.id));
    const unsubscribeUserOrders = onSnapshot(userOrdersQuery, (snapshot) => {
      const oList: Order[] = [];
      snapshot.forEach((docSnap) => {
        oList.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      oList.sort((a, b) => b.id.localeCompare(a.id));
      setOrders(oList);
    }, (error) => {
      console.warn("Realtime orders sync warning (User):", error);
      try {
        const localOrdersStr = localStorage.getItem(`pak_tajarat_local_orders_${currentUser.id}`);
        if (localOrdersStr) setOrders(JSON.parse(localOrdersStr));
      } catch (_) {}
    });

    return () => unsubscribeUserOrders();
  }, [currentUser?.id, currentUser?.role]);

  const placeOrder = async (paymentMethod: string, shippingAddress: any, billingAddress?: any): Promise<{ success: boolean; order?: Order }> => {
    if (cart.length === 0) {
      addNotification('Cart Empty', 'Your cart is empty. Add items before checking out.', 'warning');
      return { success: false };
    }

    const orderId = `PAK-${Math.floor(100000 + Math.random() * 900000)}`;
    const refAffiliateId = sessionStorage.getItem('paktajarat_ref_affiliate_id') || localStorage.getItem('paktajarat_ref_affiliate_id');
    
    // Accurate product level override or global percentage calculation
    const commissionEarned = cart.reduce((sum, item) => {
      const rate = (item.product as any).affiliateCommissionRate ?? commissionRate ?? 10;
      return sum + Math.round((item.product.price * item.quantity) * (rate / 100));
    }, 0);

    const newOrder: Order = {
      id: orderId,
      userId: currentUser?.id || 'guest-user',
      items: [...cart],
      subtotal: cartTotals.subtotal,
      shipping: cartTotals.shipping,
      discount: cartTotals.discount,
      total: cartTotals.total,
      status: 'Pending',
      paymentMethod,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    if (refAffiliateId) {
      (newOrder as any).affiliateId = refAffiliateId;
      (newOrder as any).referralCommissionEarned = commissionEarned;
    }

    // Always decrement product stock
    for (const item of cart) {
      try {
        await updateStock(item.product.id, Math.max(0, item.product.stock - item.quantity));
      } catch (e) {
        console.warn("Stock decrement warning:", e);
      }
    }

    // Always attempt write directly to Firebase Firestore
    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
      console.log(`✅ Order ${orderId} successfully written to Firestore database.`);
    } catch (firestoreError) {
      console.warn("Firestore order write warning, storing offline fallback:", firestoreError);
    }

    // If affiliate referral exists, record conversion
    if (refAffiliateId) {
      try {
        const refTxId = `ref-${Date.now()}`;
        const refTx: ReferralTransaction = {
          id: refTxId,
          affiliateId: refAffiliateId,
          referredUserId: currentUser?.id || 'guest-user',
          orderId,
          purchaseAmount: cartTotals.total,
          commissionAmount: commissionEarned,
          status: 'pending',
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          type: 'conversion'
        };

        await setDoc(doc(db, 'referrals', refTxId), refTx);
        sessionStorage.removeItem('paktajarat_ref_affiliate_id');
        localStorage.removeItem('paktajarat_ref_affiliate_id');
      } catch (refError) {
        console.warn("Affiliate referral write warning:", refError);
      }
    }

    // Update local state and localStorage cache
    setOrders(prev => {
      const updated = [newOrder, ...prev.filter(o => o.id !== newOrder.id)];
      const storageKey = currentUser?.id ? `pak_tajarat_local_orders_${currentUser.id}` : 'pak_tajarat_local_orders_guest';
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
        // Also save to all orders cache for admin offline view
        const existingAllStr = localStorage.getItem('pak_tajarat_all_orders_cache') || '[]';
        const existingAll: Order[] = JSON.parse(existingAllStr);
        localStorage.setItem('pak_tajarat_all_orders_cache', JSON.stringify([newOrder, ...existingAll.filter(o => o.id !== newOrder.id)]));
      } catch (_) {}
      return updated;
    });

    clearCart();
    addNotification('Order Placed!', `Your order ${orderId} has been successfully placed.`, 'success');
    return { success: true, order: newOrder };
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    // 1. Update in Firestore
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      console.log(`✅ Order ${orderId} status updated to ${status} in Firestore.`);
    } catch (err) {
      console.warn("Could not update order status in Firestore:", err);
    }

    // 2. Update local state and cache
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status } : o);
      try {
        const storageKey = currentUser?.id ? `pak_tajarat_local_orders_${currentUser.id}` : 'pak_tajarat_local_orders_guest';
        localStorage.setItem(storageKey, JSON.stringify(updated));
        const existingAllStr = localStorage.getItem('pak_tajarat_all_orders_cache') || '[]';
        const existingAll: Order[] = JSON.parse(existingAllStr);
        localStorage.setItem('pak_tajarat_all_orders_cache', JSON.stringify(existingAll.map(o => o.id === orderId ? { ...o, status } : o)));
      } catch (_) {}
      return updated;
    });

    addNotification('Order Status Changed', `Order #${orderId} status updated to ${status}.`, 'info');

    // 3. Update referral commissions if applicable
    if (status === 'Delivered') {
      try {
        const refQuery = query(collection(db, 'referrals'), where('orderId', '==', orderId), where('status', '==', 'pending'));
        const snap = await getDocs(refQuery);

        for (const rDoc of snap.docs) {
          const refTx = rDoc.data() as ReferralTransaction;
          const commAmt = refTx.commissionAmount || 0;

          await updateDoc(doc(db, 'referrals', rDoc.id), {
            status: 'cooling',
            deliveryDate: new Date().toISOString()
          });

          addNotification('Commission Cooling Started', `Order ${orderId} delivered! Rs. ${commAmt.toLocaleString()} entered cooling period.`, 'info');
        }
      } catch (e) {
        console.warn("Referral update on delivery warning:", e);
      }
    } else if (status === 'Cancelled') {
      try {
        const refQuery = query(collection(db, 'referrals'), where('orderId', '==', orderId));
        const snap = await getDocs(refQuery);
        for (const rDoc of snap.docs) {
          const refTx = rDoc.data() as ReferralTransaction;
          if (refTx.status === 'pending' || refTx.status === 'cooling') {
            await updateDoc(doc(db, 'referrals', rDoc.id), { status: 'rejected' });
            addNotification('Referral Rejected', `Commission on cancelled order ${orderId} voided.`, 'warning');
          }
        }
      } catch (e) {
        console.warn("Referral update on cancel warning:", e);
      }
    }
  };

  return (
    <OrdersContext.Provider value={{
      orders, placeOrder, updateOrderStatus
    }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};
