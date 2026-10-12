import { CartItem } from './cart';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
  };
  billingAddress?: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
  };
  date: string;
}
