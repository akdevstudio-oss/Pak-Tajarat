import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Coupon, Product } from '../../shared/types';
import { INITIAL_COUPONS } from '../../data/initialData';
import { db, auth } from '../../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { useUI } from '../ui/UIContext';
import { useAuth } from '../auth/AuthContext';
import { useProducts } from '../products/ProductsContext';

export interface CartTotals {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  activeCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  allCoupons: Coupon[];
  addCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;
  assignCouponReward: (code: string, affiliateId: string, eligibility: string) => Promise<void>;

  cartTotals: CartTotals;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useUI();
  const { currentUser } = useAuth();
  const { products } = useProducts();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pak_tajarat_cart');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [allCoupons, setAllCoupons] = useState<Coupon[]>(INITIAL_COUPONS);

  // Sync Cart to localStorage
  useEffect(() => {
    localStorage.setItem('pak_tajarat_cart', JSON.stringify(cart));
  }, [cart]);

  // Realtime sync Coupons from Firestore
  useEffect(() => {
    const unsubscribeCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const list: Coupon[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Coupon);
      });
      if (list.length === 0) {
        setAllCoupons(INITIAL_COUPONS);
      } else {
        setAllCoupons(list);
      }
    }, (error) => {
      console.error("Error reading coupons:", error);
      setAllCoupons(INITIAL_COUPONS);
    });

    return () => unsubscribeCoupons();
  }, []);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock <= 0) {
      addNotification('Out of Stock', `Sorry, ${product.name} is currently out of stock.`, 'warning');
      return;
    }

    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      const potentialQty = existing.quantity + quantity;
      if (potentialQty > product.stock) {
        addNotification('Stock Limit Reached', `Only ${product.stock} items are available.`, 'warning');
        return;
      }
      setCart(prev => prev.map(item => item.product.id === product.id ? { ...item, quantity: potentialQty } : item));
      addNotification('Cart Updated', `Increased quantity of ${product.name} in cart.`, 'success');
    } else {
      setCart(prev => [...prev, { product, quantity }]);
      addNotification('Added to Cart', `Added ${product.name} to your shopping cart.`, 'success');
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    if (quantity > prod.stock) {
      addNotification('Stock Limit Reached', `Only ${prod.stock} items are available in inventory.`, 'warning');
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    addNotification('Removed from Cart', 'Item removed from your shopping cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const match = allCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!match) {
      return { success: false, message: 'Invalid coupon code.' };
    }
    const currentSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    if (match.minSpend && currentSubtotal < match.minSpend) {
      return { success: false, message: `Minimum spend of Rs. ${match.minSpend} required.` };
    }
    setActiveCoupon(match);
    addNotification('Coupon Applied', `Coupon "${match.code}" applied successfully!`, 'success');
    return { success: true, message: 'Coupon applied successfully.' };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
    addNotification('Coupon Removed', 'Coupon code removed from cart.', 'info');
  };

  const addCoupon = async (coup: Coupon) => {
    const isLocalUser = !currentUser || currentUser.id.startsWith('local-') || !auth.currentUser;
    if (isLocalUser) {
      setAllCoupons(prev => [coup, ...prev]);
      addNotification('Coupon Created (Local)', `Coupon code "${coup.code}" has been created.`, 'success');
      return;
    }
    try {
      await setDoc(doc(db, 'coupons', coup.code), coup);
      addNotification('Coupon Created', `Coupon code "${coup.code}" has been created.`, 'success');
    } catch (err) {
      console.error("Error creating coupon:", err);
    }
  };

  const deleteCoupon = async (code: string) => {
    const isLocalUser = !currentUser || currentUser.id.startsWith('local-') || !auth.currentUser;
    if (isLocalUser) {
      setAllCoupons(prev => prev.filter(c => c.code !== code));
      addNotification('Coupon Deleted (Local)', `Coupon code "${code}" has been removed.`, 'info');
      return;
    }
    try {
      await deleteDoc(doc(db, 'coupons', code));
      addNotification('Coupon Deleted', `Coupon code "${code}" has been removed.`, 'info');
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  };

  const assignCouponReward = async (code: string, affiliateId: string, eligibility: string) => {
    const isLocalUser = !currentUser || currentUser.id.startsWith('local-') || !auth.currentUser;
    if (isLocalUser) {
      setAllCoupons(prev => prev.map(c => c.code === code ? { ...c, isReward: true, assignedTo: affiliateId, eligibility } : c));
      addNotification('Reward Assigned (Local)', `Coupon ${code} assigned successfully.`, 'success');
      return;
    }
    try {
      const copDoc = await getDoc(doc(db, 'coupons', code));
      if (!copDoc.exists()) {
        addNotification('Coupon Error', `Coupon code "${code}" does not exist.`, 'warning');
        return;
      }

      await updateDoc(doc(db, 'coupons', code), {
        isReward: true,
        assignedTo: affiliateId,
        eligibility
      });

      addNotification('Reward Assigned!', `Coupon ${code} assigned to affiliate for "${eligibility}".`, 'success');
    } catch (err) {
      console.error("Error assigning reward", err);
    }
  };

  // Compute Cart Totals
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 250;
  let discount = 0;
  if (activeCoupon) {
    if (activeCoupon.type === 'fixed') {
      discount = activeCoupon.discount;
    } else {
      discount = (subtotal * activeCoupon.discount) / 100;
    }
  }
  const total = Math.max(0, subtotal + shipping - discount);

  const cartTotals: CartTotals = {
    subtotal,
    shipping,
    discount,
    total
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, updateCartQuantity, removeFromCart, clearCart,
      activeCoupon, applyCoupon, removeCoupon,
      allCoupons, addCoupon, deleteCoupon, assignCouponReward,
      cartTotals
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
