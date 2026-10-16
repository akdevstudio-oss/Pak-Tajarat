import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '../../shared/types';
import { useUI } from '../ui/UIContext';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../cart/CartContext';
import { useAffiliate } from '../affiliate/AffiliateContext';

export interface OrdersContextType {
  orders: Order[];
  placeOrder: (paymentMethod: string, shippingAddress: any, billingAddress?: any) => Promise<{ success: boolean; order?: Order }>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
}
const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

async function readError(response: Response) {
  const data = await response.json().catch(() => ({}));
  return String(data.error || 'Order service is temporarily unavailable.');
}

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useUI();
  const { currentUser } = useAuth();
  const { cart, cartTotals, clearCart } = useCart();
  const { commissionRate } = useAffiliate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let active = true;
    const storageKey = currentUser?.id ? `pak_tajarat_local_orders_${currentUser.id}` : 'pak_tajarat_local_orders_guest';
    if (!currentUser) {
      try { setOrders(JSON.parse(localStorage.getItem(storageKey) || '[]')); } catch { setOrders([]); }
      return;
    }
    fetch('/api/orders', { credentials: 'include', cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error(await readError(response));
        return response.json();
      })
      .then(data => {
        if (!active || !Array.isArray(data.orders)) return;
        const list = data.orders as Order[];
        setOrders(list);
        try {
          localStorage.setItem(storageKey, JSON.stringify(list));
          if (currentUser.role === 'Admin' || currentUser.role === 'Worker') localStorage.setItem('pak_tajarat_all_orders_cache', JSON.stringify(list));
        } catch {}
      })
      .catch(error => {
        console.warn('MongoDB order sync unavailable; showing cached orders.', error);
        try { if (active) setOrders(JSON.parse(localStorage.getItem(storageKey) || (currentUser.role === 'Admin' || currentUser.role === 'Worker' ? localStorage.getItem('pak_tajarat_all_orders_cache') : null) || '[]')); } catch {}
      });
    return () => { active = false; };
  }, [currentUser?.id, currentUser?.role]);

  const placeOrder = async (paymentMethod: string, shippingAddress: any, billingAddress?: any): Promise<{ success: boolean; order?: Order }> => {
    if (!cart.length) {
      addNotification('Cart Empty', 'Your cart is empty. Add items before checking out.', 'warning');
      return { success: false };
    }
    const refAffiliateId = sessionStorage.getItem('paktajarat_ref_affiliate_id') || localStorage.getItem('paktajarat_ref_affiliate_id') || '';
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })),
          paymentMethod,
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          discount: cartTotals.discount,
          affiliateId: refAffiliateId,
          commissionRate
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok || !data.order) throw new Error(data.error || 'Could not save your order.');
      const order = data.order as Order;
      setOrders(prev => {
        const updated = [order, ...prev.filter(item => item.id !== order.id)];
        try {
          const key = currentUser?.id ? `pak_tajarat_local_orders_${currentUser.id}` : 'pak_tajarat_local_orders_guest';
          localStorage.setItem(key, JSON.stringify(updated));
          const all = JSON.parse(localStorage.getItem('pak_tajarat_all_orders_cache') || '[]') as Order[];
          localStorage.setItem('pak_tajarat_all_orders_cache', JSON.stringify([order, ...all.filter(item => item.id !== order.id)]));
        } catch {}
        return updated;
      });
      sessionStorage.removeItem('paktajarat_ref_affiliate_id');
      localStorage.removeItem('paktajarat_ref_affiliate_id');
      clearCart();
      addNotification('Order Placed!', `Your order ${order.id} has been saved.`, 'success');
      return { success: true, order };
    } catch (error) {
      addNotification('Order Not Placed', error instanceof Error ? error.message : 'Please try again.', 'warning');
      return { success: false };
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const response = await fetch('/api/orders', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status })
    });
    if (!response.ok) throw new Error(await readError(response));
    setOrders(prev => {
      const updated = prev.map(order => order.id === orderId ? { ...order, status } : order);
      try {
        localStorage.setItem(currentUser?.id ? `pak_tajarat_local_orders_${currentUser.id}` : 'pak_tajarat_local_orders_guest', JSON.stringify(updated));
        const all = JSON.parse(localStorage.getItem('pak_tajarat_all_orders_cache') || '[]') as Order[];
        localStorage.setItem('pak_tajarat_all_orders_cache', JSON.stringify(all.map(order => order.id === orderId ? { ...order, status } : order)));
      } catch {}
      return updated;
    });
    addNotification('Order Status Changed', `Order #${orderId} status updated to ${status}.`, 'info');
  };

  return <OrdersContext.Provider value={{ orders, placeOrder, updateOrderStatus }}>{children}</OrdersContext.Provider>;
};
export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used within an OrdersProvider');
  return context;
};
