import { useUI } from '../../features/ui';
import { useAuth } from '../../features/auth';
import { useProducts } from '../../features/products';
import { useCart } from '../../features/cart';
import { useAffiliate } from '../../features/affiliate';
import { useOrders } from '../../features/orders';

export const useApp = () => {
  const ui = useUI();
  const auth = useAuth();
  const products = useProducts();
  const cart = useCart();
  const affiliate = useAffiliate();
  const orders = useOrders();

  return {
    ...ui,
    ...auth,
    ...products,
    ...cart,
    ...affiliate,
    ...orders,
    // Aliases for CheckoutView compatibility
    appliedCoupon: cart.activeCoupon,
    applyCouponCode: cart.applyCoupon,
    removeCouponCode: cart.removeCoupon,
  };
};

export default useApp;
