import React from 'react';
import { UIProvider } from '../features/ui';
import { AuthProvider } from '../features/auth';
import { ProductsProvider } from '../features/products';
import { CartProvider } from '../features/cart';
import { AffiliateProvider } from '../features/affiliate';
import { OrdersProvider } from '../features/orders';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UIProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <AffiliateProvider>
              <OrdersProvider>
                {children}
              </OrdersProvider>
            </AffiliateProvider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </UIProvider>
  );
};

export default AppProvider;
